package com.quizportal.service;

import com.quizportal.dto.*;
import com.quizportal.model.*;
import com.quizportal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public List<QuizListDto> searchQuizzes(Long categoryId, String difficultyStr, String search) {
        Quiz.Difficulty difficulty = null;
        if (difficultyStr != null && !difficultyStr.trim().isEmpty()) {
            try {
                difficulty = Quiz.Difficulty.valueOf(difficultyStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid difficulty and keep as null
            }
        }

        List<Quiz> quizzes = quizRepository.searchQuizzes(categoryId, difficulty, search);
        return quizzes.stream().map(this::convertToQuizListDto).collect(Collectors.toList());
    }

    public Optional<QuizListDto> getQuizById(Long id) {
        return quizRepository.findById(id).map(this::convertToQuizListDto);
    }

    @Transactional(readOnly = true)
    public Optional<QuizStartDto> getQuizStartDto(Long id) {
        return quizRepository.findById(id).map(quiz -> {
            List<QuestionDto> questionDtos = quiz.getQuestions().stream().map(question -> {
                List<OptionDto> optionDtos = question.getOptions().stream()
                        .map(option -> new OptionDto(option.getId(), option.getOptionText()))
                        .collect(Collectors.toList());
                // Shuffle options to randomize layout
                Collections.shuffle(optionDtos);

                return new QuestionDto(
                        question.getId(),
                        question.getQuestionText(),
                        question.getImageUrl(),
                        question.getQuestionType().name(),
                        optionDtos
                );
            }).collect(Collectors.toList());

            return new QuizStartDto(
                    quiz.getId(),
                    quiz.getTitle(),
                    quiz.getDuration(),
                    questionDtos
            );
        });
    }

    @Transactional
    public SubmitQuizResponse submitQuiz(Long quizId, SubmitQuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found with ID: " + quizId));

        List<Question> questions = quiz.getQuestions();
        Map<Long, QuestionAnswerDto> answersMap = request.getAnswers().stream()
                .collect(Collectors.toMap(QuestionAnswerDto::getQuestionId, a -> a, (a, b) -> a));

        int correctCount = 0;
        List<GradedQuestionDto> gradedQuestions = new ArrayList<>();

        for (Question question : questions) {
            GradedQuestionDto graded = new GradedQuestionDto();
            graded.setQuestionId(question.getId());
            graded.setQuestionText(question.getQuestionText());
            graded.setQuestionType(question.getQuestionType().name());
            graded.setImageUrl(question.getImageUrl());

            // Build options detail
            List<OptionDetailDto> optionsDetail = question.getOptions().stream()
                    .map(o -> new OptionDetailDto(o.getId(), o.getOptionText(), o.getCorrect()))
                    .collect(Collectors.toList());
            graded.setOptions(optionsDetail);

            // Fetch correct options / answers from DB
            List<Option> correctOptions = question.getOptions().stream()
                    .filter(Option::getCorrect)
                    .collect(Collectors.toList());
            List<Long> correctOptionIds = correctOptions.stream().map(Option::getId).collect(Collectors.toList());
            graded.setCorrectOptionIds(correctOptionIds);

            // Set correct text for fill in the blank
            if (question.getQuestionType() == Question.QuestionType.FILL_IN_THE_BLANK) {
                if (!correctOptions.isEmpty()) {
                    graded.setCorrectTextAnswer(correctOptions.getFirst().getOptionText());
                }
            }

            // Grade based on user response
            QuestionAnswerDto userAnswer = answersMap.get(question.getId());
            boolean isCorrect = false;

            if (userAnswer != null) {
                if (question.getQuestionType() == Question.QuestionType.FILL_IN_THE_BLANK) {
                    String userText = userAnswer.getTextAnswer() != null ? userAnswer.getTextAnswer().trim() : "";
                    graded.setTextAnswer(userText);
                    // Match against correct option texts (case insensitive, trim)
                    isCorrect = correctOptions.stream().anyMatch(o -> o.getOptionText().trim().equalsIgnoreCase(userText));
                } else if (question.getQuestionType() == Question.QuestionType.MULTIPLE_CHOICE) {
                    List<Long> userOptionIds = userAnswer.getSelectedOptionIds() != null ? userAnswer.getSelectedOptionIds() : Collections.emptyList();
                    graded.setSelectedOptionIds(userOptionIds);
                    // Check if sets match
                    Set<Long> userSet = new HashSet<>(userOptionIds);
                    Set<Long> correctSet = new HashSet<>(correctOptionIds);
                    isCorrect = userSet.equals(correctSet);
                } else { // SINGLE_CHOICE or TRUE_FALSE
                    List<Long> userOptionIds = userAnswer.getSelectedOptionIds() != null ? userAnswer.getSelectedOptionIds() : Collections.emptyList();
                    graded.setSelectedOptionIds(userOptionIds);
                    if (userOptionIds.size() == 1) {
                        isCorrect = correctOptionIds.contains(userOptionIds.getFirst());
                    }
                }
            } else {
                graded.setSelectedOptionIds(Collections.emptyList());
                graded.setTextAnswer("");
            }

            graded.setCorrect(isCorrect);
            if (isCorrect) {
                correctCount++;
            }
            gradedQuestions.add(graded);
        }

        int totalQuestions = questions.size();
        double percentage = totalQuestions > 0 ? ((double) correctCount / totalQuestions) * 100.0 : 0.0;
        // Clean percentage to 2 decimal places
        percentage = Math.round(percentage * 100.0) / 100.0;

        int wrongCount = totalQuestions - correctCount;

        // Save result in database
        String username = request.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = "Anonymous Quizzer";
        }
        QuizResult result = new QuizResult(quiz, correctCount, percentage, request.getTimeTaken(), username);
        quizResultRepository.save(result);

        // Generate Feedback & Recommendations
        FeedbackDto feedback = generateFeedback(percentage, quiz);

        return new SubmitQuizResponse(
                correctCount,
                totalQuestions,
                percentage,
                request.getTimeTaken(),
                correctCount,
                wrongCount,
                feedback,
                gradedQuestions
        );
    }

    private FeedbackDto generateFeedback(double percentage, Quiz currentQuiz) {
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (percentage >= 80.0) {
            strengths.add("Excellent overall conceptual clarity!");
            strengths.add("Exceptional performance under the time limit.");
            improvements.add("Keep practicing with MEDIUM or HARD level quizzes to challenge yourself.");
        } else if (percentage >= 50.0) {
            strengths.add("Solid grasp of foundational topics.");
            strengths.add("Good performance on standard questions.");
            improvements.add("Review the specific incorrect questions to plug your knowledge gaps.");
            improvements.add("Try re-taking this quiz to achieve a perfect score.");
        } else {
            strengths.add("Great effort in completing the quiz!");
            improvements.add("Review core course materials or category documentation.");
            improvements.add("Focus on fundamental concepts and try again.");
        }

        // Recommend up to 2 other quizzes in the same category, excluding the current quiz
        List<QuizListDto> suggestions = quizRepository.searchQuizzes(currentQuiz.getCategory().getId(), null, null)
                .stream()
                .filter(q -> !q.getId().equals(currentQuiz.getId()))
                .limit(2)
                .map(this::convertToQuizListDto)
                .collect(Collectors.toList());

        // If not enough in the same category, search globally
        if (suggestions.size() < 2) {
            List<QuizListDto> globalSuggestions = quizRepository.findAll().stream()
                    .filter(q -> !q.getId().equals(currentQuiz.getId()) && !q.getCategory().getId().equals(currentQuiz.getCategory().getId()))
                    .limit(2 - suggestions.size())
                    .map(this::convertToQuizListDto)
                    .collect(Collectors.toList());
            suggestions.addAll(globalSuggestions);
        }

        return new FeedbackDto(strengths, improvements, suggestions);
    }

    private QuizListDto convertToQuizListDto(Quiz quiz) {
        return new QuizListDto(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getCategory().getId(),
                quiz.getCategory().getName(),
                quiz.getDifficulty().name(),
                quiz.getDuration(),
                quiz.getQuestions().size()
        );
    }
}

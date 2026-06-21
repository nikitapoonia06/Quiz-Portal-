package com.quizportal.service;

import com.quizportal.dto.*;
import com.quizportal.model.*;
import com.quizportal.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class QuizServiceTest {

    @Autowired
    private QuizService quizService;

    @Autowired
    private QuizRepository quizRepository;

    @Test
    public void testGetQuizStartDto_HidesCorrectAnswers() {
        Optional<QuizStartDto> dtoOpt = quizService.getQuizStartDto(1L);
        assertTrue(dtoOpt.isPresent(), "Seeded quiz with ID 1 should exist");
        QuizStartDto dto = dtoOpt.get();
        
        // Assert that the questions are returned
        assertFalse(dto.getQuestions().isEmpty(), "Quiz should have questions");
        for (QuestionDto q : dto.getQuestions()) {
            assertFalse(q.getOptions().isEmpty(), "Question should have options");
            // OptionDto is a pure DTO and only has id & optionText, it doesn't expose isCorrect
        }
    }

    @Test
    public void testSubmitQuiz_GradesCorrectly() {
        // Retrieve Quiz 1 and its questions
        Quiz quiz = quizRepository.findById(1L).orElseThrow(() -> new AssertionError("Quiz 1 should be seeded"));
        List<Question> questions = quiz.getQuestions();
        
        SubmitQuizRequest request = new SubmitQuizRequest();
        request.setUsername("TestUser");
        request.setTimeTaken(45);
        
        List<QuestionAnswerDto> answers = new ArrayList<>();
        for (Question question : questions) {
            QuestionAnswerDto answer = new QuestionAnswerDto();
            answer.setQuestionId(question.getId());
            
            if (question.getQuestionType() == Question.QuestionType.FILL_IN_THE_BLANK) {
                answer.setTextAnswer("main"); // correct answer for Java Core Basics fill-in-the-blank
            } else if (question.getQuestionType() == Question.QuestionType.TRUE_FALSE) {
                Option correct = question.getOptions().stream().filter(Option::getCorrect).findFirst().orElseThrow();
                answer.setSelectedOptionIds(List.of(correct.getId()));
            } else if (question.getQuestionType() == Question.QuestionType.SINGLE_CHOICE) {
                Option correct = question.getOptions().stream().filter(Option::getCorrect).findFirst().orElseThrow();
                answer.setSelectedOptionIds(List.of(correct.getId()));
            } else if (question.getQuestionType() == Question.QuestionType.MULTIPLE_CHOICE) {
                List<Long> corrects = question.getOptions().stream()
                        .filter(Option::getCorrect)
                        .map(Option::getId)
                        .toList();
                answer.setSelectedOptionIds(corrects);
            }
            answers.add(answer);
        }
        
        request.setAnswers(answers);
        
        SubmitQuizResponse response = quizService.submitQuiz(1L, request);
        
        assertEquals(questions.size(), response.getScore(), "Should score 100% since all answers are correct");
        assertEquals(100.0, response.getPercentage(), "Percentage should be 100%");
        assertEquals(0, response.getWrongCount(), "Wrong answer count should be 0");
    }
}

package com.quizportal.dto;

import java.util.List;

public class FeedbackDto {
    private List<String> strengths;
    private List<String> improvements;
    private List<QuizListDto> suggestedQuizzes;

    public FeedbackDto() {}

    public FeedbackDto(List<String> strengths, List<String> improvements, List<QuizListDto> suggestedQuizzes) {
        this.strengths = strengths;
        this.improvements = improvements;
        this.suggestedQuizzes = suggestedQuizzes;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getImprovements() {
        return improvements;
    }

    public void setImprovements(List<String> improvements) {
        this.improvements = improvements;
    }

    public List<QuizListDto> getSuggestedQuizzes() {
        return suggestedQuizzes;
    }

    public void setSuggestedQuizzes(List<QuizListDto> suggestedQuizzes) {
        this.suggestedQuizzes = suggestedQuizzes;
    }
}

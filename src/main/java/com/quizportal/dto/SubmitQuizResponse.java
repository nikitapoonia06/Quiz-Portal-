package com.quizportal.dto;

import java.util.List;

public class SubmitQuizResponse {
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private Integer timeTaken;
    private Integer correctCount;
    private Integer wrongCount;
    private FeedbackDto feedback;
    private List<GradedQuestionDto> questions;

    public SubmitQuizResponse() {}

    public SubmitQuizResponse(Integer score, Integer totalQuestions, Double percentage, Integer timeTaken, Integer correctCount, Integer wrongCount, FeedbackDto feedback, List<GradedQuestionDto> questions) {
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.percentage = percentage;
        this.timeTaken = timeTaken;
        this.correctCount = correctCount;
        this.wrongCount = wrongCount;
        this.feedback = feedback;
        this.questions = questions;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Integer getTimeTaken() {
        return timeTaken;
    }

    public void setTimeTaken(Integer timeTaken) {
        this.timeTaken = timeTaken;
    }

    public Integer getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(Integer correctCount) {
        this.correctCount = correctCount;
    }

    public Integer getWrongCount() {
        return wrongCount;
    }

    public void setWrongCount(Integer wrongCount) {
        this.wrongCount = wrongCount;
    }

    public FeedbackDto getFeedback() {
        return feedback;
    }

    public void setFeedback(FeedbackDto feedback) {
        this.feedback = feedback;
    }

    public List<GradedQuestionDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<GradedQuestionDto> questions) {
        this.questions = questions;
    }
}

package com.quizportal.dto;

import java.util.List;

public class GradedQuestionDto {
    private Long questionId;
    private String questionText;
    private String questionType;
    private String imageUrl;
    private List<Long> selectedOptionIds;
    private List<Long> correctOptionIds;
    private String correctTextAnswer;
    private String textAnswer;
    private Boolean isCorrect;
    private List<OptionDetailDto> options;

    public GradedQuestionDto() {}

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<Long> getSelectedOptionIds() {
        return selectedOptionIds;
    }

    public void setSelectedOptionIds(List<Long> selectedOptionIds) {
        this.selectedOptionIds = selectedOptionIds;
    }

    public List<Long> getCorrectOptionIds() {
        return correctOptionIds;
    }

    public void setCorrectOptionIds(List<Long> correctOptionIds) {
        this.correctOptionIds = correctOptionIds;
    }

    public String getCorrectTextAnswer() {
        return correctTextAnswer;
    }

    public void setCorrectTextAnswer(String correctTextAnswer) {
        this.correctTextAnswer = correctTextAnswer;
    }

    public String getTextAnswer() {
        return textAnswer;
    }

    public void setTextAnswer(String textAnswer) {
        this.textAnswer = textAnswer;
    }

    public Boolean getCorrect() {
        return isCorrect;
    }

    public void setCorrect(Boolean correct) {
        isCorrect = correct;
    }

    public List<OptionDetailDto> getOptions() {
        return options;
    }

    public void setOptions(List<OptionDetailDto> options) {
        this.options = options;
    }
}

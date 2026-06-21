package com.quizportal.dto;

import java.util.List;

public class QuestionAnswerDto {
    private Long questionId;
    private List<Long> selectedOptionIds;
    private String textAnswer;

    public QuestionAnswerDto() {}

    public QuestionAnswerDto(Long questionId, List<Long> selectedOptionIds, String textAnswer) {
        this.questionId = questionId;
        this.selectedOptionIds = selectedOptionIds;
        this.textAnswer = textAnswer;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public List<Long> getSelectedOptionIds() {
        return selectedOptionIds;
    }

    public void setSelectedOptionIds(List<Long> selectedOptionIds) {
        this.selectedOptionIds = selectedOptionIds;
    }

    public String getTextAnswer() {
        return textAnswer;
    }

    public void setTextAnswer(String textAnswer) {
        this.textAnswer = textAnswer;
    }
}

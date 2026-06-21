package com.quizportal.dto;

import java.util.List;

public class SubmitQuizRequest {
    private String username;
    private Integer timeTaken; // in seconds
    private List<QuestionAnswerDto> answers;

    public SubmitQuizRequest() {}

    public SubmitQuizRequest(String username, Integer timeTaken, List<QuestionAnswerDto> answers) {
        this.username = username;
        this.timeTaken = timeTaken;
        this.answers = answers;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getTimeTaken() {
        return timeTaken;
    }

    public void setTimeTaken(Integer timeTaken) {
        this.timeTaken = timeTaken;
    }

    public List<QuestionAnswerDto> getAnswers() {
        return answers;
    }

    public void setAnswers(List<QuestionAnswerDto> answers) {
        this.answers = answers;
    }
}

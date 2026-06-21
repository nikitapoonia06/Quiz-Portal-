package com.quizportal.dto;

import java.util.List;

public class QuizStartDto {
    private Long id;
    private String title;
    private Integer duration;
    private List<QuestionDto> questions;

    public QuizStartDto() {}

    public QuizStartDto(Long id, String title, Integer duration, List<QuestionDto> questions) {
        this.id = id;
        this.title = title;
        this.duration = duration;
        this.questions = questions;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public List<QuestionDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionDto> questions) {
        this.questions = questions;
    }
}

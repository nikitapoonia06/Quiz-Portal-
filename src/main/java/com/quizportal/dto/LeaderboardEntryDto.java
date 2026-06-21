package com.quizportal.dto;

import java.time.LocalDateTime;

public class LeaderboardEntryDto {
    private Long quizId;
    private String quizTitle;
    private String username;
    private Integer score;
    private Double percentage;
    private Integer completionTime;
    private LocalDateTime createdAt;

    public LeaderboardEntryDto() {}

    public LeaderboardEntryDto(Long quizId, String quizTitle, String username, Integer score, Double percentage, Integer completionTime, LocalDateTime createdAt) {
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.username = username;
        this.score = score;
        this.percentage = percentage;
        this.completionTime = completionTime;
        this.createdAt = createdAt;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Integer getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(Integer completionTime) {
        this.completionTime = completionTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

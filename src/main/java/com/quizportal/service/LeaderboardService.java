package com.quizportal.service;

import com.quizportal.dto.LeaderboardEntryDto;
import com.quizportal.model.QuizResult;
import com.quizportal.repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    @Autowired
    private QuizResultRepository quizResultRepository;

    public List<LeaderboardEntryDto> getGlobalLeaderboard() {
        List<QuizResult> results = quizResultRepository.findTop10ByOrderByPercentageDescCompletionTimeAsc();
        return results.stream().map(this::convertToEntryDto).collect(Collectors.toList());
    }

    public List<LeaderboardEntryDto> getQuizLeaderboard(Long quizId) {
        List<QuizResult> results = quizResultRepository.findTop10ByQuizIdOrderByPercentageDescCompletionTimeAsc(quizId);
        return results.stream().map(this::convertToEntryDto).collect(Collectors.toList());
    }

    private LeaderboardEntryDto convertToEntryDto(QuizResult result) {
        return new LeaderboardEntryDto(
                result.getQuiz().getId(),
                result.getQuiz().getTitle(),
                result.getUsername(),
                result.getScore(),
                result.getPercentage(),
                result.getCompletionTime(),
                result.getCreatedAt()
        );
    }
}

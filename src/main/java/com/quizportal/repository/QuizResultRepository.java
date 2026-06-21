package com.quizportal.repository;

import com.quizportal.model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {

    // Quiz-specific leaderboard
    List<QuizResult> findTop10ByQuizIdOrderByPercentageDescCompletionTimeAsc(Long quizId);

    // Global leaderboard
    List<QuizResult> findTop10ByOrderByPercentageDescCompletionTimeAsc();
}

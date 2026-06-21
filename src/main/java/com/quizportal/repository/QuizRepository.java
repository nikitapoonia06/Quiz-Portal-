package com.quizportal.repository;

import com.quizportal.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    @Query("SELECT q FROM Quiz q WHERE " +
           "(:categoryId IS NULL OR q.category.id = :categoryId) AND " +
           "(:difficulty IS NULL OR q.difficulty = :difficulty) AND " +
           "(:search IS NULL OR LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(q.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Quiz> searchQuizzes(
            @Param("categoryId") Long categoryId,
            @Param("difficulty") Quiz.Difficulty difficulty,
            @Param("search") String search);
}

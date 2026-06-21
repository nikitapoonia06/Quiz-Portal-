package com.quizportal.controller;

import com.quizportal.dto.*;
import com.quizportal.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @GetMapping
    public ResponseEntity<List<QuizListDto>> searchQuizzes(
            @RequestParam(value = "category", required = false) Long categoryId,
            @RequestParam(value = "difficulty", required = false) String difficulty,
            @RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(quizService.searchQuizzes(categoryId, difficulty, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizListDto> getQuizById(@PathVariable Long id) {
        return quizService.getQuizById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/start")
    public ResponseEntity<QuizStartDto> startQuiz(@PathVariable Long id) {
        return quizService.getQuizStartDto(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmitQuizResponse> submitQuiz(
            @PathVariable Long id,
            @RequestBody SubmitQuizRequest request) {
        try {
            SubmitQuizResponse response = quizService.submitQuiz(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

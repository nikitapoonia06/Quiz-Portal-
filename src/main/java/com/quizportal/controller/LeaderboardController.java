package com.quizportal.controller;

import com.quizportal.dto.LeaderboardEntryDto;
import com.quizportal.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardEntryDto>> getGlobalLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard());
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<LeaderboardEntryDto>> getQuizLeaderboard(@PathVariable Long quizId) {
        return ResponseEntity.ok(leaderboardService.getQuizLeaderboard(quizId));
    }
}

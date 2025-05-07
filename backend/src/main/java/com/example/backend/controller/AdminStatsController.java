package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.service.AdminStatsService;
import com.example.backend.dto.StatsResponse;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/stats")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" })
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    @Autowired
    private AdminStatsService adminStatsService;

    @GetMapping("/users")
    public ResponseEntity<?> getUserStats() {
        StatsResponse stats = adminStatsService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/posts")
    public ResponseEntity<?> getPostStats() {
        StatsResponse stats = adminStatsService.getPostStats();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/posts/today")
    public ResponseEntity<?> getTodayPostsStats() {
        int todayPostsCount = adminStatsService.getTodayPostsCount();
        Map<String, Object> response = new HashMap<>();
        response.put("count", todayPostsCount);
        return ResponseEntity.ok(response);
    }
}

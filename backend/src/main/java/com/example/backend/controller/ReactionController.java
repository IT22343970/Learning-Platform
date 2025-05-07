package com.example.backend.controller;

import com.example.backend.model.Reaction;
import com.example.backend.service.ReactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reactions")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" })
public class ReactionController {

    @Autowired
    private ReactionService reactionService;

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleReaction(
            @RequestParam String userId,
            @RequestParam String postId) {
        try {
            boolean isLiked = reactionService.toggleReaction(userId, postId);
            long count = reactionService.getReactionCount(postId);

            Map<String, Object> response = new HashMap<>();
            response.put("liked", isLiked);
            response.put("count", count);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getReactionStatus(
            @RequestParam String userId,
            @RequestParam String postId) {
        try {
            boolean hasReacted = reactionService.hasUserReacted(userId, postId);
            long count = reactionService.getReactionCount(postId);

            Map<String, Object> response = new HashMap<>();
            response.put("liked", hasReacted);
            response.put("count", count);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }
}

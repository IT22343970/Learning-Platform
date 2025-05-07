package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for health check endpoints to verify system status
 */
@RestController
@RequestMapping({"/api/health", "/health"})
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" })
public class HealthCheckController {
    
    /**
     * Simple health check endpoint
     * @return Basic health status
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Backend server is running properly");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Detailed health check with system information
     * @return Detailed health information
     */
    @GetMapping("/detail")
    public ResponseEntity<Map<String, Object>> detailedHealthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Backend server is running properly");
        response.put("timestamp", System.currentTimeMillis());
        
        // Add environment details
        Map<String, String> env = new HashMap<>();
        env.put("javaVersion", System.getProperty("java.version"));
        env.put("osName", System.getProperty("os.name"));
        env.put("availableProcessors", String.valueOf(Runtime.getRuntime().availableProcessors()));
        env.put("freeMemory", String.valueOf(Runtime.getRuntime().freeMemory() / (1024 * 1024)) + " MB");
        
        response.put("environment", env);
        
        return ResponseEntity.ok(response);
    }
}

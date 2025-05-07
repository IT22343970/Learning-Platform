package com.example.backend.controller;

import com.example.backend.model.Report;
import com.example.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" })
public class ReportController {
    private final Logger logger = Logger.getLogger(ReportController.class.getName());
    
    @Autowired
    private ReportService reportService;
    
    /**
     * Create a new report
     */
    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody Report report) {
        try {
            logger.info("Creating new report for post: " + report.getPostId());
            
            // Validation
            if (report.getPostId() == null || report.getPostId().isEmpty()) {
                return ResponseEntity.badRequest().body("Post ID is required");
            }
            
            if (report.getReporterId() == null || report.getReporterId().isEmpty()) {
                return ResponseEntity.badRequest().body("Reporter ID is required");
            }
            
            Report createdReport = reportService.createReport(report);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReport);
        } catch (IllegalArgumentException e) {
            logger.warning("Error creating report: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.severe("Unexpected error creating report: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred: " + e.getMessage());
        }
    }
    
    /**
     * Get all reports (admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            logger.info("Getting all reports, page: " + page + ", size: " + size);
            Page<Report> reports = reportService.getAllReports(page, size);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            logger.severe("Error getting all reports: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while retrieving reports: " + e.getMessage());
        }
    }
    
    /**
     * Get reports by status (admin only)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getReportsByStatus(@PathVariable String status) {
        try {
            logger.info("Getting reports with status: " + status);
            List<Report> reports = reportService.getReportsByStatus(status);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            logger.severe("Error getting reports by status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while retrieving reports: " + e.getMessage());
        }
    }
    
    /**
     * Get report by ID (admin only)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getReportById(@PathVariable String id) {
        try {
            logger.info("Getting report with ID: " + id);
            Optional<Report> report = reportService.getReportById(id);
            return report.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.severe("Error getting report by ID: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while retrieving the report: " + e.getMessage());
        }
    }
    
    /**
     * Get report statistics (admin only)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getReportStats() {
        try {
            logger.info("Getting report statistics");
            Map<String, Object> stats = reportService.getReportStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.severe("Error getting report stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while retrieving report statistics: " + e.getMessage());
        }
    }
    
    /**
     * Get recent reports (admin only) - limited to specified number
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRecentReports(@RequestParam(defaultValue = "5") int limit) {
        try {
            logger.info("Getting recent reports, limit: " + limit);
            List<Report> reports = reportService.getRecentReports(limit);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            logger.severe("Error getting recent reports: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while retrieving recent reports: " + e.getMessage());
        }
    }
    
    /**
     * Update report status (admin only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            String adminId = payload.get("adminId");
            String adminNote = payload.get("adminNote");
            
            if (status == null || adminId == null) {
                return ResponseEntity.badRequest().body("Status and adminId are required");
            }
            
            logger.info("Updating report " + id + " status to: " + status);
            Report updatedReport = reportService.updateReportStatus(id, status, adminId, adminNote);
            return ResponseEntity.ok(updatedReport);
        } catch (IllegalArgumentException e) {
            logger.warning("Error updating report status: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.severe("Unexpected error updating report status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred: " + e.getMessage());
        }
    }
    
    /**
     * Delete reported post and mark report as resolved (admin only)
     */
    @DeleteMapping("/{id}/post")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReportedPost(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        try {
            String adminId = payload.get("adminId");
            String adminNote = payload.get("adminNote");
            
            if (adminId == null) {
                return ResponseEntity.badRequest().body("Admin ID is required");
            }
            
            logger.info("Deleting reported post for report ID: " + id);
            reportService.deleteReportedPost(id, adminId, adminNote);
            return ResponseEntity.ok().body("Post deleted and report resolved");
        } catch (IllegalArgumentException e) {
            logger.warning("Error deleting reported post: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.severe("Unexpected error deleting reported post: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred: " + e.getMessage());
        }
    }
}

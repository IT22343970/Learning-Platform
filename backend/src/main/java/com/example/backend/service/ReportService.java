package com.example.backend.service;

import com.example.backend.model.Post;
import com.example.backend.model.Report;
import com.example.backend.model.User;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.ReportRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new report
     */
    public Report createReport(Report report) {
        // Check if post exists
        Optional<Post> postOpt = postRepository.findById(report.getPostId());
        if (!postOpt.isPresent()) {
            throw new IllegalArgumentException("Post not found");
        }
        
        // Check if reporter exists
        Optional<User> userOpt = userRepository.findById(report.getReporterId());
        if (!userOpt.isPresent()) {
            throw new IllegalArgumentException("User not found");
        }
        
        // Set reporter name
        User reporter = userOpt.get();
        report.setReporterName(reporter.getFirstName() + " " + reporter.getLastName());
        
        // Set default status and dates
        report.setStatus("PENDING");
        report.setCreatedAt(new Date());
        
        return reportRepository.save(report);
    }
    
    /**
     * Get all reports with pagination
     */
    public Page<Report> getAllReports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return reportRepository.findAll(pageable);
    }
    
    /**
     * Get reports by status with pagination
     */
    public List<Report> getReportsByStatus(String status) {
        return reportRepository.findByStatus(status);
    }
    
    /**
     * Get report by ID
     */
    public Optional<Report> getReportById(String id) {
        return reportRepository.findById(id);
    }
    
    /**
     * Update report status
     */
    public Report updateReportStatus(String id, String status, String adminId, String adminNote) {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (!reportOpt.isPresent()) {
            throw new IllegalArgumentException("Report not found");
        }
        
        Report report = reportOpt.get();
        report.setStatus(status);
        report.setUpdatedAt(new Date());
        report.setAdminId(adminId);
        report.setAdminNote(adminNote);
        
        return reportRepository.save(report);
    }
    
    /**
     * Delete a post and update the report as resolved
     */
    public void deleteReportedPost(String reportId, String adminId, String adminNote) {
        Optional<Report> reportOpt = reportRepository.findById(reportId);
        if (!reportOpt.isPresent()) {
            throw new IllegalArgumentException("Report not found");
        }
        
        Report report = reportOpt.get();
        
        // Delete the post
        postRepository.deleteById(report.getPostId());
        
        // Update the report status
        report.setStatus("RESOLVED");
        report.setUpdatedAt(new Date());
        report.setAdminId(adminId);
        report.setAdminNote(adminNote);
        
        reportRepository.save(report);
    }
    
    /**
     * Get report statistics
     */
    public Map<String, Object> getReportStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalReports = reportRepository.count();
        long pendingReports = reportRepository.countByStatus("PENDING");
        long resolvedReports = reportRepository.countByStatus("RESOLVED");
        long rejectedReports = reportRepository.countByStatus("REJECTED");
        
        stats.put("total", totalReports);
        stats.put("pending", pendingReports);
        stats.put("resolved", resolvedReports);
        stats.put("rejected", rejectedReports);
        
        return stats;
    }
    
    /**
     * Get recent reports with limit
     */
    public List<Report> getRecentReports(int limit) {
        // Create pageable request sorted by createdAt descending
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Report> reports = reportRepository.findAll(pageable);
        return reports.getContent();
    }
}

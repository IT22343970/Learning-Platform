package com.example.backend.repository;

import com.example.backend.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReportRepository extends MongoRepository<Report, String> {
    List<Report> findByStatus(String status);
    List<Report> findByPostId(String postId);
    List<Report> findByReporterId(String reporterId);
    long countByStatus(String status);
}

package com.example.backend.repository;

import com.example.backend.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByPostIdOrderByCreatedAtAsc(String postId);

    List<Comment> findByUserIdOrderByCreatedAtDesc(String userId);

    Page<Comment> findByPostIdOrderByCreatedAtDesc(String postId, Pageable pageable);
}

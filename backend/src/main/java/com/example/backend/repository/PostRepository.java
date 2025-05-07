package com.example.backend.repository;

import com.example.backend.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query("{ 'mediaIds': ?0 }")
    Optional<Post> findFirstByMediaId(String mediaId);

    @Query("{ 'mediaIds': { $in: [?0] }}")
    List<Post> findByMediaIdsContaining(String mediaId);

    long countByCreatedAtGreaterThan(LocalDateTime date);

    long countByCreatedAtGreaterThanEqual(Date date);
}
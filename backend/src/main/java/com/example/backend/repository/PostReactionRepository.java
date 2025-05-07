package com.example.backend.repository;

import com.example.backend.model.PostReaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PostReactionRepository extends MongoRepository<PostReaction, String> {
    List<PostReaction> findByPostId(String postId);

    Optional<PostReaction> findByPostIdAndUserId(String postId, String userId);

    void deleteByPostIdAndUserId(String postId, String userId);

    int countByPostId(String postId);
}

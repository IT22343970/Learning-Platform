package com.example.backend.service;

import com.example.backend.model.Post;
import com.example.backend.model.Reaction;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.ReactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ReactionService {

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private PostRepository postRepository;

    public boolean toggleReaction(String userId, String postId) {
        try {
            Optional<Reaction> existingReaction = reactionRepository.findByUserIdAndPostId(userId, postId);

            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            if (existingReaction.isPresent()) {
                reactionRepository.delete(existingReaction.get());
                updatePostReactionCount(postId);
                return false;
            }

            Reaction newReaction = new Reaction(userId, postId);
            reactionRepository.save(newReaction);
            updatePostReactionCount(postId);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to toggle reaction: " + e.getMessage());
        }
    }

    private void updatePostReactionCount(String postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            long likeCount = reactionRepository.countByPostId(postId);
            post.setLikes((int) likeCount);
            postRepository.save(post);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update reaction count: " + e.getMessage());
        }
    }

    public long getReactionCount(String postId) {
        return reactionRepository.countByPostId(postId);
    }

    public boolean hasUserReacted(String userId, String postId) {
        return reactionRepository.findByUserIdAndPostId(userId, postId).isPresent();
    }
}

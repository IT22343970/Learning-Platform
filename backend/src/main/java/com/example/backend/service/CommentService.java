package com.example.backend.service;

import com.example.backend.model.Comment;
import com.example.backend.model.CommentResponse;
import com.example.backend.model.Post;
import com.example.backend.model.User;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository,
            PostRepository postRepository,
            UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse(comment);

        try {
            userRepository.findById(comment.getUserId()).ifPresent(user -> {
                response.setUserName(user.getFirstName() + " " + user.getLastName());
                response.setUserProfilePicture(user.getProfilePicture());
            });
        } catch (Exception e) {
            // If user not found, use default values
            response.setUserName("Deleted User");
            response.setUserProfilePicture(null);
        }

        return response;
    }

    public CommentResponse createComment(String postId, String userId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setContent(content);

        Comment savedComment = commentRepository.save(comment);

        // Update post's comments list
        post.getComments().add(savedComment.getId());
        postRepository.save(post);

        return convertToCommentResponse(savedComment);
    }

    public CommentResponse updateComment(String commentId, String userId, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own comments");
        }

        comment.setContent(content);
        comment.setUpdatedAt(LocalDateTime.now());
        Comment updatedComment = commentRepository.save(comment);

        return convertToCommentResponse(updatedComment);
    }

    public void deleteComment(String commentId, String userId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        // If user is admin, allow deletion regardless of ownership
        if (isAdmin) {
            // Remove comment ID from post's comments list if post still exists
            postRepository.findById(comment.getPostId()).ifPresent(post -> {
                post.getComments().remove(commentId);
                postRepository.save(post);
            });

            // Delete the comment
            commentRepository.deleteById(commentId);
            return;
        }

        Post post = postRepository.findById(comment.getPostId())
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        // Check if user is either comment owner or post owner
        if (!comment.getUserId().equals(userId) && !post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to delete this comment");
        }

        // Remove comment ID from post's comments list
        post.getComments().remove(commentId);
        postRepository.save(post);

        // Delete the comment
        commentRepository.deleteById(commentId);
    }

    // Keep the original method for backward compatibility
    public void deleteComment(String commentId, String userId) {
        deleteComment(commentId, userId, false);
    }

    public List<CommentResponse> getPostComments(String postId) {
        try {
            return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                    .stream()
                    .map(this::convertToCommentResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Log error and return empty list
            System.err.println("Error fetching comments for post " + postId + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public Page<CommentResponse> getPostComments(String postId, PageRequest pageRequest) {
        try {
            Page<Comment> commentPage = commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageRequest);
            List<CommentResponse> commentResponses = commentPage.getContent().stream()
                    .map(this::convertToCommentResponse)
                    .collect(Collectors.toList());

            return new PageImpl<>(
                    commentResponses,
                    pageRequest,
                    commentPage.getTotalElements());
        } catch (Exception e) {
            // Log error and return empty page
            System.err.println("Error fetching paged comments for post " + postId + ": " + e.getMessage());
            return new PageImpl<>(Collections.emptyList(), pageRequest, 0);
        }
    }

    public List<CommentResponse> getPostComments(String postId, int limit) {
        try {
            return commentRepository.findByPostIdOrderByCreatedAtDesc(postId, PageRequest.of(0, limit))
                    .getContent()
                    .stream()
                    .map(this::convertToCommentResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Log error and return empty list
            System.err.println("Error fetching limited comments for post " + postId + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }
}

package com.skillshare.service;

import com.skillshare.dto.CommentDto;
import com.skillshare.model.Comment;
import com.skillshare.model.Post;
import com.skillshare.repository.CommentRepository;
import com.skillshare.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepo;
    private final PostRepository postRepo;

    // ✅ Add comment
    public Comment addComment(CommentDto dto) {
        Comment comment = new Comment();
        comment.setPostId(dto.getPostId());
        comment.setUserId(dto.getUserId());
        comment.setText(dto.getText());
        comment.setCreatedAt(new Date());
        return commentRepo.save(comment);
    }

    // ✅ Get all comments for a post
    public List<Comment> getComments(String postId) {
        return commentRepo.findByPostId(postId);
    }

    // ✅ Get comment by ID
    public Optional<Comment> getCommentById(String commentId) {
        return commentRepo.findById(commentId);
    }

    // ✅ Update comment
    public Optional<Comment> updateComment(String commentId, String newText) {
        return commentRepo.findById(commentId).map(comment -> {
            comment.setText(newText);
            return commentRepo.save(comment);
        });
    }

    // ✅ Delete comment
    public void deleteComment(String commentId) {
        commentRepo.deleteById(commentId);
    }
}

package com.skillshare.service;

import com.skillshare.dto.CommentDto;
import com.skillshare.dto.LikeRequest;
import com.skillshare.model.Comment;
import com.skillshare.model.Post;
import com.skillshare.repository.CommentRepository;
import com.skillshare.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepo;
    private final CommentRepository commentRepo;
    private final NotificationService notificationService; // ✅ Injected
    private final String UPLOAD_DIR = "uploads/";

    public Post createPostWithImage(String userId, String content, MultipartFile file) throws IOException {
        Post post = new Post();
        post.setUserId(userId);
        post.setContent(content);
        post.setCreatedAt(new Date());

        if (file != null && !file.isEmpty()) {
            String fileName = savePostImage(file);
            post.setMediaUrls(Collections.singletonList(fileName));
        }

        return postRepo.save(post);
    }

    public Optional<Post> updatePostWithImage(String postId, String content, MultipartFile file) throws IOException {
        return postRepo.findById(postId).map(post -> {
            post.setContent(content);
            if (file != null && !file.isEmpty()) {
                try {
                    // Delete existing media
                    if (post.getMediaUrls() != null) {
                        for (String fileName : post.getMediaUrls()) {
                            Files.deleteIfExists(Paths.get(UPLOAD_DIR + fileName));
                        }
                    }
                    String newFile = savePostImage(file);
                    post.setMediaUrls(Collections.singletonList(newFile));
                } catch (IOException e) {
                    throw new RuntimeException("Failed to update image: " + e.getMessage());
                }
            }
            return postRepo.save(post);
        });
    }

    public List<Post> getAllPosts() {
        return postRepo.findAll();
    }

    public Optional<Post> getPostById(String postId) {
        return postRepo.findById(postId);
    }

    public void deletePost(String postId) {
        postRepo.findById(postId).ifPresent(post -> {
            if (post.getMediaUrls() != null) {
                for (String file : post.getMediaUrls()) {
                    try {
                        Files.deleteIfExists(Paths.get(UPLOAD_DIR + file));
                    } catch (IOException ignored) {}
                }
            }
            postRepo.deleteById(postId);
        });
    }

    public void likePost(String postId, LikeRequest req) {
        postRepo.findById(postId).ifPresent(post -> {
            if (!post.getLikedUserIds().contains(req.getUserId())) {
                post.getLikedUserIds().add(req.getUserId());
                postRepo.save(post);


                // ✅ Send notification to the post owner
                if (!req.getUserId().equals(post.getUserId())) {
                    notificationService.sendNotification(
                            post.getUserId(), req.getUserId(), "like", postId, "❤️ Someone liked your post."
                    );
                }
            }
        });
    }

    public void unlikePost(String postId, LikeRequest req) {
        postRepo.findById(postId).ifPresent(post -> {
            post.getLikedUserIds().remove(req.getUserId());
            postRepo.save(post);
        });
    }

    public void commentPost(CommentDto dto) {
        Comment comment = new Comment();
        comment.setPostId(dto.getPostId());
        comment.setUserId(dto.getUserId());
        comment.setText(dto.getText());
        comment.setCreatedAt(new Date());
        commentRepo.save(comment);

        // ✅ Notify the post owner
        Optional<Post> post = postRepo.findById(dto.getPostId());
        post.ifPresent(p -> {
            if (!p.getUserId().equals(dto.getUserId())) {
                notificationService.sendNotification(
                        p.getUserId(), dto.getUserId(), "comment", p.getId(), "💬 Someone commented on your post."
                );
            }
        });
    }

    public List<Comment> getComments(String postId) {
        return commentRepo.findByPostId(postId);
    }

    public Optional<Comment> getCommentById(String commentId) {
        return commentRepo.findById(commentId);
    }

    public Optional<Comment> updateComment(String commentId, String newText) {
        return commentRepo.findById(commentId).map(comment -> {
            comment.setText(newText);
            return commentRepo.save(comment);
        });
    }

    public void deleteComment(String commentId) {
        commentRepo.deleteById(commentId);
    }

    public String savePostImage(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(UPLOAD_DIR + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());
        return fileName;
    }
}

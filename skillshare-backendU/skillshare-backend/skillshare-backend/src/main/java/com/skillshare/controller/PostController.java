package com.skillshare.controller;

import com.skillshare.dto.CommentDto;
import com.skillshare.dto.LikeRequest;
import com.skillshare.model.Comment;
import com.skillshare.model.Post;
import com.skillshare.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping("/create")
    public ResponseEntity<?> createPostWithImage(
            @RequestParam("userId") String userId,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            Post created = postService.createPostWithImage(userId, content, file);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Post with image created ✅");
            response.put("post", created);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<Post> posts = postService.getAllPosts();
        Map<String, Object> response = new HashMap<>();
        response.put("count", posts.size());
        response.put("posts", posts);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getById(@PathVariable String postId) {
        return postService.getPostById(postId)
                .map(post -> {
                    Map<String, Object> res = new HashMap<>();
                    res.put("post", post);
                    return ResponseEntity.ok(res);
                })
                .orElse(ResponseEntity.status(404).body(Collections.singletonMap("error", "Post not found")));
    }

    @PutMapping("/{postId}/update")
    public ResponseEntity<?> updatePostWithImage(
            @PathVariable String postId,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            return postService.updatePostWithImage(postId, content, file)
                    .map(updated -> {
                        Map<String, Object> res = new HashMap<>();
                        res.put("message", "Post updated ✅");
                        res.put("post", updated);
                        return ResponseEntity.ok(res);
                    })
                    .orElse(ResponseEntity.status(404).body(Collections.singletonMap("error", "Post not found")));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok(Collections.singletonMap("message", "Post deleted ✅"));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> like(@PathVariable String postId, @RequestBody LikeRequest request) {
        postService.likePost(postId, request);
        return ResponseEntity.ok(Collections.singletonMap("message", "Post liked 👍"));
    }

    @PostMapping("/{postId}/unlike")
    public ResponseEntity<?> unlike(@PathVariable String postId, @RequestBody LikeRequest request) {
        postService.unlikePost(postId, request);
        return ResponseEntity.ok(Collections.singletonMap("message", "Post unliked 👎"));
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<?> comment(@RequestBody CommentDto dto) {
        postService.commentPost(dto);
        return ResponseEntity.ok(Collections.singletonMap("message", "Comment added 💬"));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<?> getComments(@PathVariable String postId) {
        List<Comment> comments = postService.getComments(postId);
        Map<String, Object> response = new HashMap<>();
        response.put("count", comments.size());
        response.put("comments", comments);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/comments/{commentId}")
    public ResponseEntity<?> getCommentById(@PathVariable String commentId) {
        return postService.getCommentById(commentId)
                .map(comment -> {
                    Map<String, Object> res = new HashMap<>();
                    res.put("comment", comment);
                    return ResponseEntity.ok(res);
                })
                .orElse(ResponseEntity.status(404).body(Collections.singletonMap("error", "Comment not found")));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable String commentId, @RequestBody CommentDto dto) {
        return postService.updateComment(commentId, dto.getText())
                .map(updated -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Comment updated ✅");
                    response.put("comment", updated);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(404).body(Collections.singletonMap("error", "Comment not found")));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String commentId) {
        postService.deleteComment(commentId);
        return ResponseEntity.ok(Collections.singletonMap("message", "Comment deleted 🗑"));
    }
}

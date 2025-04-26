package com.skillshare.service;

import com.skillshare.dto.LikeRequest;
import com.skillshare.model.Post;
import com.skillshare.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final PostRepository postRepo;

    // ✅ Like a post
    public boolean likePost(String postId, String userId) {
        Optional<Post> optional = postRepo.findById(postId);
        if (optional.isPresent()) {
            Post post = optional.get();
            if (!post.getLikedUserIds().contains(userId)) {
                post.getLikedUserIds().add(userId);
                postRepo.save(post);
                return true;
            }
        }
        return false;
    }

    // ✅ Unlike a post
    public boolean unlikePost(String postId, String userId) {
        Optional<Post> optional = postRepo.findById(postId);
        if (optional.isPresent()) {
            Post post = optional.get();
            if (post.getLikedUserIds().contains(userId)) {
                post.getLikedUserIds().remove(userId);
                postRepo.save(post);
                return true;
            }
        }
        return false;
    }
}

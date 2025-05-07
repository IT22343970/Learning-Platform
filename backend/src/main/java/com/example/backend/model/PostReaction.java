package com.example.backend.model;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;

@Document(collection = "post_reactions")
public class PostReaction {
    @Id
    private String id;
    private String postId;
    private String userId;
    private Reaction reaction;
    private long timestamp;

    public PostReaction() {
    }

    public PostReaction(String postId, String userId, Reaction reaction) {
        this.postId = postId;
        this.userId = userId;
        this.reaction = reaction;
        this.timestamp = System.currentTimeMillis();
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPostId() {
        return postId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Reaction getReaction() {
        return reaction;
    }

    public void setReaction(Reaction reaction) {
        this.reaction = reaction;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}

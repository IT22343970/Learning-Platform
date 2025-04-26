package com.skillshare.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId;      // Receiver
    private String senderId;    // Triggered by
    private String type;        // "like", "comment", "follow"
    private String postId;      // Optional for post-related actions
    private String message;
    private Date createdAt;
}

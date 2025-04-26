package com.skillshare.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

@Document(collection = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    @Id
    private String id;
    private String userId;
    private String content;
    private List<String> mediaUrls = new ArrayList<>();
    private Set<String> likedUserIds = new HashSet<>();
    private Date createdAt = new Date();
}

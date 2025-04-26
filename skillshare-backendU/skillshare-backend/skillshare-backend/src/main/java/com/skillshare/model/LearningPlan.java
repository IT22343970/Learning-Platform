package com.skillshare.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("learning_plans")
public class LearningPlan {

    @Id
    private String id;
    private String title;
    private String description;
    private List<String> topics;
    private Date deadline;
    private Date createdAt;
    private String userId; // 👤 Assigned to a specific user
}

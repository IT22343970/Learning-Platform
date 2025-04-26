package com.skillshare.dto;

import lombok.Data;

@Data
public class CommentDto {
    private String postId;
    private String userId;
    private String text;
}

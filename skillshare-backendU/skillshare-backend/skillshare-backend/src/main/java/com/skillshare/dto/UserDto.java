package com.skillshare.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String firstname;
    private String lastname;
    private String profilePic;
    private String bio;
}

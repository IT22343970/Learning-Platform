package com.skillshare.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String firstname;
    private String lastname;
    private String email;
    private String password;

    // ✅ Add these two fields below
    private String profilePic;  // image filename or full URL
    private String bio;         // user bio or description

    private Set<String> followers = new HashSet<>();
    private Set<String> following = new HashSet<>();
}

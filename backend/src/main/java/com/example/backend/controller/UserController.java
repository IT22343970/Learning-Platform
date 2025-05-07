package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" })
public class UserController {
    
    // Static inner class to handle role update requests
    public static class RoleUpdateRequest {
        private String role;
        
        // Default constructor needed for JSON deserialization
        public RoleUpdateRequest() {
        }
        
        public RoleUpdateRequest(String role) {
            this.role = role;
        }
        
        public String getRole() {
            return role;
        }
        
        public void setRole(String role) {
            this.role = role;
        }
    }
    
    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable String userId,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) MultipartFile profilePicture) {
        try {
            User updatedUser = userService.updateUserProfile(userId, firstName, lastName, bio, profilePicture);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{userId}/posts")
    public ResponseEntity<?> getUserPosts(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(userService.getUserPosts(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}/update-role")
    public ResponseEntity<?> updateUserRole(@PathVariable String userId, @RequestBody RoleUpdateRequest request) {
        try {
            // Log the request for debugging
            System.out.println("Updating role for user: " + userId + " to: " + request.getRole());
            
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            // Validate the role
            String newRole = request.getRole();
            if (!newRole.equals("ROLE_USER") && !newRole.equals("ROLE_ADMIN")) {
                return ResponseEntity.badRequest().body("Invalid role: " + newRole);
            }
            
            // Update the user role
            user.setRole(newRole);
            User updatedUser = userService.saveUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Keep this method for backward compatibility but have it use the update-role endpoint
    @PutMapping("/{userId}/promote-to-admin")
    public ResponseEntity<?> promoteToAdmin(@PathVariable String userId) {
        try {
            RoleUpdateRequest request = new RoleUpdateRequest("ROLE_ADMIN");
            return updateUserRole(userId, request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Keep this method for backward compatibility but have it use the update-role endpoint
    @PutMapping("/{userId}/demote-to-user")
    public ResponseEntity<?> demoteToUser(@PathVariable String userId) {
        try {
            RoleUpdateRequest request = new RoleUpdateRequest("ROLE_USER");
            return updateUserRole(userId, request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

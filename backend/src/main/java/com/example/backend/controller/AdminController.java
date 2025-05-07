package com.example.backend.controller;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AdminService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" })
public class AdminController {
    private final Logger logger = Logger.getLogger(AdminController.class.getName());
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AdminService adminService;

    /**
     * Get all users
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        logger.info("Fetching all users");
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    /**
     * Get all blocked users
     */
    @GetMapping("/users/blocked")
    public ResponseEntity<List<User>> getBlockedUsers() {
        logger.info("Fetching blocked users");
        List<User> blockedUsers = adminService.getBlockedUsers();
        return ResponseEntity.ok(blockedUsers);
    }

    /**
     * Create a new user
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            logger.info("Creating new user with email: " + user.getEmail());
            User createdUser = adminService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (IllegalArgumentException e) {
            logger.warning("Error creating user: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Update an existing user
     */
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody User userUpdates) {
        logger.info("Received request to update user: " + userId);
        
        try {
            // Log the received user update data for debugging
            logger.info("User update data: " + userUpdates.toString());
            
            // Validate if user exists before attempting to update - with helpful error message
            Optional<User> existingUserOpt = userRepository.findById(userId);
            if (existingUserOpt.isEmpty()) {
                logger.warning("User not found with ID: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found with ID: " + userId);
            }
            
            // Pass the existing user to the service layer to ensure it exists
            User updatedUser = adminService.updateUser(userId, userUpdates);
            logger.info("Successfully updated user: " + userId);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            logger.warning("Bad request for user update: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.severe("Error updating user: " + e.getMessage());
            e.printStackTrace(); // Add stack trace logging for better debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update user: " + e.getMessage());
        }
    }

    /**
     * Delete a user
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            logger.info("Attempting to delete user with ID: " + userId);
            
            // Validate if user exists before attempting to delete
            if (!userRepository.existsById(userId)) {
                logger.warning("User not found with ID: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found with ID: " + userId);
            }
            
            adminService.deleteUser(userId);
            logger.info("Successfully deleted user: " + userId);
            return ResponseEntity.ok().body("User successfully deleted");
        } catch (Exception e) {
            logger.severe("Error deleting user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete user: " + e.getMessage());
        }
    }

    /**
     * Toggle user status (enabled/disabled)
     */
    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable String userId) {
        try {
            logger.info("Attempting to toggle status for user: " + userId);
            
            // Validate if user exists
            if (!userRepository.existsById(userId)) {
                logger.warning("User not found with ID: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found with ID: " + userId);
            }
            
            User user = adminService.toggleUserStatus(userId);
            logger.info("Successfully toggled status for user: " + userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.severe("Error toggling user status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to toggle user status: " + e.getMessage());
        }
    }

    /**
     * Update user role endpoint
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String userId, @RequestBody Map<String, String> payload) {
        try {
            logger.info("Updating role for user: " + userId);
            
            // Extract role from payload
            String role = payload.get("role");
            if (role == null || (!role.equals("ROLE_USER") && !role.equals("ROLE_ADMIN"))) {
                return ResponseEntity.badRequest().body("Invalid role specified");
            }
            
            // Find the user by ID
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found with ID: " + userId);
            }
            
            // Update the user's role
            User user = userOpt.get();
            user.setRole(role);
            User updatedUser = userRepository.save(user);
            logger.info("Successfully updated role for user: " + userId + " to " + role);
            
            // Return sanitized user object
            return ResponseEntity.ok(adminService.sanitizeUserForResponse(updatedUser));
        } catch (Exception e) {
            logger.severe("Error updating user role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update user role: " + e.getMessage());
        }
    }
}

package com.example.backend.service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final Logger logger = Logger.getLogger(AdminService.class.getName());
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
            .map(this::sanitizeUserForResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all blocked users
     */
    public List<User> getBlockedUsers() {
        List<User> users = userRepository.findByEnabledFalse();
        return users.stream()
            .map(this::sanitizeUserForResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Create a new user
     */
    public User createUser(User user) {
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            logger.warning("Email already exists: " + user.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }
        
        // Set raw password (for authentication)
        String rawPassword = user.getPassword();
        user.setRawPassword(rawPassword);
        
        // Encode password for storage
        user.setPassword(passwordEncoder.encode(rawPassword));
        
        // Set creation date if needed
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(new Date());
        }
        
        logger.info("Saving new user: " + user.getEmail() + " with role: " + user.getRole());
        
        // Save user
        User savedUser = userRepository.save(user);
        
        // Return sanitized user
        return sanitizeUserForResponse(savedUser);
    }
    
    /**
     * Update an existing user
     */
    public User updateUser(String userId, User userUpdates) {
        logger.info("Attempting to update user with ID: " + userId);
        
        // Explicitly retrieve user by ID
        User existingUser = userRepository.findById(userId)
            .orElseThrow(() -> {
                logger.warning("User not found in updateUser service with ID: " + userId);
                return new IllegalArgumentException("User not found with ID: " + userId);
            });
        
        // Log that we found the user for debug purposes
        logger.info("Found user to update: " + existingUser.getEmail());
        
        // Update fields if provided
        if (userUpdates.getFirstName() != null && !userUpdates.getFirstName().isEmpty()) {
            existingUser.setFirstName(userUpdates.getFirstName());
            logger.info("Updated firstName to: " + userUpdates.getFirstName());
        }
        
        if (userUpdates.getLastName() != null && !userUpdates.getLastName().isEmpty()) {
            existingUser.setLastName(userUpdates.getLastName());
            logger.info("Updated lastName to: " + userUpdates.getLastName());
        }
        
        if (userUpdates.getEmail() != null && !userUpdates.getEmail().isEmpty()) {
            // Check if email is being changed and if new email already exists
            if (!existingUser.getEmail().equals(userUpdates.getEmail())) {
                if (userRepository.existsByEmail(userUpdates.getEmail())) {
                    logger.warning("Email already exists: " + userUpdates.getEmail());
                    throw new IllegalArgumentException("Email already exists");
                }
                existingUser.setEmail(userUpdates.getEmail());
                logger.info("Updated email to: " + userUpdates.getEmail());
            }
        }
        
        // Handle password updates if provided - unchanged
        
        // Update role if provided
        if (userUpdates.getRole() != null && !userUpdates.getRole().isEmpty()) {
            if (userUpdates.getRole().equals("ROLE_USER") || userUpdates.getRole().equals("ROLE_ADMIN")) {
                existingUser.setRole(userUpdates.getRole());
                logger.info("Role updated to: " + userUpdates.getRole());
            } else {
                logger.warning("Invalid role: " + userUpdates.getRole());
                throw new IllegalArgumentException("Invalid role: " + userUpdates.getRole());
            }
        }
        
        // Update enabled status if provided
        if (userUpdates.isEnabled() != existingUser.isEnabled()) {
            existingUser.setEnabled(userUpdates.isEnabled());
            logger.info("Enabled status updated to: " + userUpdates.isEnabled());
        }
        
        // Save and return updated user
        try {
            User savedUser = userRepository.save(existingUser);
            logger.info("User updated successfully: " + userId);
            return sanitizeUserForResponse(savedUser);
        } catch (Exception e) {
            logger.severe("Error saving updated user: " + e.getMessage());
            e.printStackTrace(); // Add stack trace for debugging
            throw new RuntimeException("Failed to save updated user: " + e.getMessage(), e);
        }
    }
    
    /**
     * Delete a user
     */
    public void deleteUser(String userId) {
        logger.info("Attempting to delete user with ID: " + userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            logger.warning("User not found with ID: " + userId);
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
        
        User user = userOpt.get();
        userRepository.delete(user);
        logger.info("User deleted successfully: " + userId);
    }
    
    /**
     * Toggle user status (enabled/disabled)
     */
    public User toggleUserStatus(String userId) {
        logger.info("Toggling status for user with ID: " + userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            logger.warning("User not found with ID: " + userId);
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
        
        User user = userOpt.get();
        // Toggle status
        user.setEnabled(!user.isEnabled());
        User updatedUser = userRepository.save(user);
        
        logger.info("User status toggled to: " + user.isEnabled());
        return sanitizeUserForResponse(updatedUser);
    }
    
    /**
     * Sanitize user object for response (remove sensitive information)
     */
    public User sanitizeUserForResponse(User user) {
        // Create a copy to avoid modifying the original entity
        User sanitizedUser = new User();
        sanitizedUser.setId(user.getId());
        sanitizedUser.setFirstName(user.getFirstName());
        sanitizedUser.setLastName(user.getLastName());
        sanitizedUser.setEmail(user.getEmail());
        sanitizedUser.setRole(user.getRole());
        sanitizedUser.setBio(user.getBio());
        sanitizedUser.setProfilePicture(user.getProfilePicture());
        sanitizedUser.setEnabled(user.isEnabled());
        sanitizedUser.setCreatedAt(user.getCreatedAt());
        // Don't set password
        
        return sanitizedUser;
    }
}

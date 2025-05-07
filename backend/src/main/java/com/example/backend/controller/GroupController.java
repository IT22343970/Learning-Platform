package com.example.backend.controller;

import com.example.backend.model.Group;
import com.example.backend.service.GroupService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" })
public class GroupController {
    private static final Logger logger = LoggerFactory.getLogger(GroupController.class);

    @Autowired
    private GroupService groupService;

    @PostMapping
    public ResponseEntity<?> createGroup(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("userId") String userId,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage) {
        try {
            logger.info("Creating group: {}", name);
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Group name is required");
            }
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("User ID is required");
            }

            Group group = groupService.createGroup(name, description, userId, coverImage);
            return ResponseEntity.ok(group);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid group data: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating group: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body("Failed to create group: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllGroups() {
        try {
            return ResponseEntity.ok(groupService.getAllGroups());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserGroups(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(groupService.getUserGroups(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<?> updateGroup(
            @PathVariable String groupId,
            @RequestParam String userId,
            @RequestParam String name,
            @RequestParam String description) {
        try {
            Group updatedGroup = groupService.updateGroup(groupId, userId, name, description);
            return ResponseEntity.ok(updatedGroup);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update group: " + e.getMessage());
        }
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(
            @PathVariable String groupId,
            @RequestParam String userId) {
        try {
            groupService.deleteGroup(groupId, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete group: " + e.getMessage());
        }
    }
}

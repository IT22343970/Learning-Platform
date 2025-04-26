package com.skillshare.controller;

import com.skillshare.dto.UserDto;
import com.skillshare.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        Map<String, Object> response = new HashMap<>();
        response.put("count", users.size());
        response.put("users", users);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(user -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("user", user);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(404)
                        .body(Collections.singletonMap("error", "User not found")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserDto dto) {
        return userService.updateUser(id, dto)
                .map(updated -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "User updated 💖");
                    response.put("user", updated);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(404)
                        .body(Collections.singletonMap("error", "User not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "User deleted ✅"));
    }

    // ✅ Follow a user
    @PostMapping("/{id}/follow")
    public ResponseEntity<?> followUser(@PathVariable String id, @RequestParam String followerId) {
        boolean followed = userService.followUser(id, followerId);
        return followed
                ? ResponseEntity.ok(Collections.singletonMap("message", "Followed successfully 💬"))
                : ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid follow request"));
    }

    // ✅ Unfollow a user
    @PostMapping("/{id}/unfollow")
    public ResponseEntity<?> unfollowUser(@PathVariable String id, @RequestParam String followerId) {
        boolean unfollowed = userService.unfollowUser(id, followerId);
        return unfollowed
                ? ResponseEntity.ok(Collections.singletonMap("message", "Unfollowed successfully"))
                : ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid unfollow request"));
    }

    // ✅ Get followers list
    @GetMapping("/{id}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable String id) {
        Set<String> followers = userService.getFollowers(id);
        return ResponseEntity.ok(Collections.singletonMap("followers", followers));
    }

    // ✅ Get following list
    @GetMapping("/{id}/following")
    public ResponseEntity<?> getFollowing(@PathVariable String id) {
        Set<String> following = userService.getFollowing(id);
        return ResponseEntity.ok(Collections.singletonMap("following", following));
    }
}

// ✅ UserService.java
package com.skillshare.service;

import com.skillshare.dto.UserDto;
import com.skillshare.model.User;
import com.skillshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final NotificationService notificationService; // ✅ Injected

    public List<UserDto> getAllUsers() {
        return userRepo.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<UserDto> getUserById(String id) {
        return userRepo.findById(id).map(this::convertToDto);
    }

    public Optional<UserDto> updateUser(String id, UserDto dto) {
        return userRepo.findById(id).map(user -> {
            user.setFirstname(dto.getFirstname());
            user.setLastname(dto.getLastname());
            user.setProfilePic(dto.getProfilePic());
            user.setBio(dto.getBio());
            return convertToDto(userRepo.save(user));
        });
    }

    public void deleteUser(String id) {
        userRepo.deleteById(id);
    }

    // ✅ Convert User -> UserDto
    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFirstname(user.getFirstname());
        dto.setLastname(user.getLastname());
        dto.setProfilePic(user.getProfilePic());
        dto.setBio(user.getBio());
        return dto;
    }

    // ✅ Follow logic
    public boolean followUser(String userId, String followerId) {
        if (userId.equals(followerId)) return false;
        Optional<User> userOpt = userRepo.findById(userId);
        Optional<User> followerOpt = userRepo.findById(followerId);
        if (userOpt.isPresent() && followerOpt.isPresent()) {
            User user = userOpt.get();
            User follower = followerOpt.get();
            user.getFollowers().add(followerId);
            follower.getFollowing().add(userId);
            userRepo.save(user);
            userRepo.save(follower);

            // ✅ Notification to the followed user
            notificationService.sendNotification(
                    userId, followerId, "follow", null, "👤 Someone followed you."
            );

            return true;
        }
        return false;
    }

    public boolean unfollowUser(String userId, String followerId) {
        Optional<User> userOpt = userRepo.findById(userId);
        Optional<User> followerOpt = userRepo.findById(followerId);
        if (userOpt.isPresent() && followerOpt.isPresent()) {
            User user = userOpt.get();
            User follower = followerOpt.get();
            user.getFollowers().remove(followerId);
            follower.getFollowing().remove(userId);
            userRepo.save(user);
            userRepo.save(follower);
            return true;
        }
        return false;
    }

    public Set<String> getFollowers(String userId) {
        return userRepo.findById(userId).map(User::getFollowers).orElse(Set.of());
    }

    public Set<String> getFollowing(String userId) {
        return userRepo.findById(userId).map(User::getFollowing).orElse(Set.of());
    }
}

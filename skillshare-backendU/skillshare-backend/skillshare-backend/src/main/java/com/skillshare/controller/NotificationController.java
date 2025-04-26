package com.skillshare.controller;

import com.skillshare.model.Notification;
import com.skillshare.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getAll(@PathVariable String userId) {
        List<Notification> list = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(Map.of(
                "count", list.size(),
                "notifications", list
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Notification deleted ✅"));
    }
}

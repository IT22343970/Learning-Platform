package com.skillshare.service;

import com.skillshare.model.Notification;
import com.skillshare.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepo;

    public Notification sendNotification(String userId, String senderId, String type, String postId, String message) {
        Notification notification = Notification.builder()
                .userId(userId)
                .senderId(senderId)
                .type(type)
                .postId(postId)
                .message(message)
                .createdAt(new Date())
                .build();
        return notificationRepo.save(notification);
    }

    public List<Notification> getNotificationsForUser(String userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void deleteNotification(String id) {
        notificationRepo.deleteById(id);
    }
}

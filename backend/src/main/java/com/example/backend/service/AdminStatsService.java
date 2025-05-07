package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dto.StatsResponse;
import com.example.backend.model.Post;
import com.example.backend.model.User;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
public class AdminStatsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    public StatsResponse getUserStats() {
        int totalUsers = (int) userRepository.count();

        // Calculate new users today
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date today = calendar.getTime();

        int newUsersToday = userRepository.countByCreatedAtGreaterThanEqual(today);

        // Calculate active users (users with enabled=true)
        int activeUsers = userRepository.countByEnabledTrue();

        return new StatsResponse(totalUsers, newUsersToday, activeUsers);
    }

    public StatsResponse getPostStats() {
        int totalPosts = (int) postRepository.count();
        return new StatsResponse(totalPosts);
    }

    public int getTodayPostsCount() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date today = calendar.getTime();

        return (int) postRepository.countByCreatedAtGreaterThanEqual(today);
    }
}

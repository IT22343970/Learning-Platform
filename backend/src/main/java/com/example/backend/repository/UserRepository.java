package com.example.backend.repository;

import com.example.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByEnabledFalse();
    List<User> findByEnabledTrue();
    boolean existsById(String id);
    int countByCreatedAtGreaterThanEqual(Date date);
    int countByEnabledTrue();
}
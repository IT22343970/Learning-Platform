package com.example.backend.repository;

import com.example.backend.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GroupRepository extends MongoRepository<Group, String> {
    List<Group> findByCreatedBy(String userId);

    boolean existsByName(String name);
}

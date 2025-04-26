package com.skillshare.service;

import com.skillshare.model.LearningPlan;
import com.skillshare.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepo;

    public LearningPlan createPlan(LearningPlan plan) {
        plan.setCreatedAt(new Date());
        return planRepo.save(plan);
    }

    public List<LearningPlan> getAllPlans() {
        return planRepo.findAll();
    }

    public List<LearningPlan> getPlansByUserId(String userId) {
        return planRepo.findByUserId(userId);
    }

    public Optional<LearningPlan> getPlanById(String id) {
        return planRepo.findById(id);
    }

    public Optional<LearningPlan> updatePlan(String id, LearningPlan updated) {
        return planRepo.findById(id).map(plan -> {
            plan.setTitle(updated.getTitle());
            plan.setDescription(updated.getDescription());
            plan.setTopics(updated.getTopics());
            plan.setDeadline(updated.getDeadline());
            return planRepo.save(plan);
        });
    }

    public void deletePlan(String id) {
        planRepo.deleteById(id);
    }
}

package com.skillshare.controller;

import com.skillshare.model.LearningPlan;
import com.skillshare.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @PostMapping
    public ResponseEntity<?> createPlan(@RequestBody LearningPlan plan) {
        LearningPlan created = planService.createPlan(plan);
        return ResponseEntity.ok(Map.of("message", "Plan created ✅", "plan", created));
    }

    @GetMapping
    public ResponseEntity<?> getAllPlans() {
        List<LearningPlan> plans = planService.getAllPlans();
        return ResponseEntity.ok(Map.of("count", plans.size(), "plans", plans));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPlansByUser(@PathVariable String userId) {
        List<LearningPlan> plans = planService.getPlansByUserId(userId);
        return ResponseEntity.ok(Map.of("count", plans.size(), "plans", plans));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, LearningPlan>> getPlanById(@PathVariable String id) {
        return planService.getPlanById(id)
                .map(plan -> ResponseEntity.ok(Map.of("plan", plan)))
                .orElse(ResponseEntity.status(404).body(null)); //
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable String id, @RequestBody LearningPlan plan) {
        return planService.updatePlan(id, plan)
                .map(updated -> ResponseEntity.ok(Map.of("message", "Plan updated ✅", "plan", updated)))
                .orElse(ResponseEntity.status(404).body(Map.of("error", "Plan not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable String id) {
        planService.deletePlan(id);
        return ResponseEntity.ok(Map.of("message", "Plan deleted ✅"));
    }
}

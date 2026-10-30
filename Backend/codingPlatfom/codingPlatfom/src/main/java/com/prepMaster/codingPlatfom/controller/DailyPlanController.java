package com.prepMaster.codingPlatfom.controller;

import java.time.LocalDate;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.prepMaster.codingPlatfom.dto.request.DailyPlanRequest;
import com.prepMaster.codingPlatfom.dto.response.PlanResponses.*;
import com.prepMaster.codingPlatfom.service.DailyPlanService;
import com.prepMaster.codingPlatfom.service.GamificationService;

@RestController
@RequestMapping("/api/plans")
public class DailyPlanController {
	private final DailyPlanService plans; private final GamificationService gamification;
	public DailyPlanController(DailyPlanService plans, GamificationService gamification) { this.plans = plans; this.gamification = gamification; }
	@PostMapping("/daily") @ResponseStatus(HttpStatus.CREATED)
	public Plan generate(Authentication auth, @Valid @RequestBody DailyPlanRequest request) { return plans.generate(userId(auth), request); }
	@GetMapping("/{id}") public Plan get(Authentication auth, @PathVariable Long id) { return plans.get(userId(auth), id); }
	@PostMapping("/tasks/{taskId}/complete")
	public Completion complete(Authentication auth, @PathVariable Long taskId) { return gamification.complete(userId(auth), taskId); }
	private long userId(Authentication auth) { return Long.parseLong(auth.getName()); }
}

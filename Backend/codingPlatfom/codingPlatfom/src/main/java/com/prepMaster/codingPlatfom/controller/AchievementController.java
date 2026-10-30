package com.prepMaster.codingPlatfom.controller;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.prepMaster.codingPlatfom.dto.response.ProgressResponses.Achievement;
import com.prepMaster.codingPlatfom.service.AchievementService;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {
	private final AchievementService service;
	public AchievementController(AchievementService service) { this.service = service; }
	@GetMapping public List<Achievement> all() { return service.all(); }
}

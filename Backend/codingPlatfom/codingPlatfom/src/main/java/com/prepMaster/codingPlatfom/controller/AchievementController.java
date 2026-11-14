package com.prepMaster.codingPlatfom.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prepMaster.codingPlatfom.dto.response.AchievementResponses.Overview;
import com.prepMaster.codingPlatfom.service.AchievementService;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

	private final AchievementService service;

	public AchievementController(AchievementService service) {
		this.service = service;
	}

	@GetMapping
	public Overview achievements(Authentication authentication) {
		return service.overview(Long.parseLong(authentication.getName()));
	}
}

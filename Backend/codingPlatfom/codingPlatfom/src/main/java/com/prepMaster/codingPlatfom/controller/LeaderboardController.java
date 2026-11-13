package com.prepMaster.codingPlatfom.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prepMaster.codingPlatfom.dto.response.LeaderboardResponses.Board;
import com.prepMaster.codingPlatfom.entity.enums.LeaderboardMetric;
import com.prepMaster.codingPlatfom.entity.enums.LeaderboardPeriod;
import com.prepMaster.codingPlatfom.service.LeaderboardService;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

	private final LeaderboardService leaderboard;

	public LeaderboardController(LeaderboardService leaderboard) {
		this.leaderboard = leaderboard;
	}

	@GetMapping
	public Board board(Authentication authentication,
			@RequestParam(defaultValue = "WEEKLY") LeaderboardPeriod period,
			@RequestParam(defaultValue = "XP") LeaderboardMetric metric,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return leaderboard.board(Long.parseLong(authentication.getName()), period, metric, page, size);
	}
}

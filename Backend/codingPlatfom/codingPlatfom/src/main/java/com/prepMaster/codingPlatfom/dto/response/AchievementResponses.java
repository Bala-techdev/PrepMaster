package com.prepMaster.codingPlatfom.dto.response;

import java.time.Instant;
import java.util.List;

public final class AchievementResponses {

	private AchievementResponses() {
	}

	public record View(Long id, String code, String name, String description, String criteriaType, boolean earned,
			Instant earnedAt, long progress, int target) {
	}

	public record Overview(List<View> achievements, long earnedCount, long totalCount) {
	}
}

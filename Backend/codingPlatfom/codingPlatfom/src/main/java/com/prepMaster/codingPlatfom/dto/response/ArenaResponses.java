package com.prepMaster.codingPlatfom.dto.response;

import java.util.List;

public final class ArenaResponses {
	private ArenaResponses() {
	}

	public record Execution(String status, String stdout, String stderr, long executionTimeMs, boolean passed) {
	}

	public record Submission(Long id, Long questionId, String language, String status, String stdout, String stderr,
			long executionTimeMs, boolean passed, int xpAwarded, String createdAt) {
	}

	public record Recommendation(Long questionId, String title, String topic, String difficulty, String reason) {
	}

	public record ArenaOverview(long totalXp, int level, String levelName, int currentStreak, long solvedProblems,
			List<Recommendation> recommendations) {
	}
}

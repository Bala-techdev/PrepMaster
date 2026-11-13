package com.prepMaster.codingPlatfom.dto.response;

import java.util.List;

public final class LeaderboardResponses {

	private LeaderboardResponses() {
	}

	public record Entry(int rank, Long userId, String username, String displayName, String avatarUrl, long value,
			long xp, long completedTasks, int currentStreak, int level, boolean currentUser) {
	}

	public record Board(String period, String metric, List<Entry> content, int page, int size, long totalElements,
			int totalPages, String from, String to) {
	}
}

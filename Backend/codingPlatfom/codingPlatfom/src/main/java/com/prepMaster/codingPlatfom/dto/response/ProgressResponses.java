package com.prepMaster.codingPlatfom.dto.response;

import java.time.LocalDate;
import java.util.List;

public final class ProgressResponses {
	private ProgressResponses() {}
	public record Progress(long completedTasks, long totalTasks, double completionRate, int currentStreak,
			int longestStreak, long totalXp, int currentLevel) {}
	public record Activity(LocalDate date, int completedTasks, long xpEarned) {}
	public record CategoryProgress(Long categoryId, String categoryName, long completedTasks) {}
	public record Achievement(Long id, String code, String name, String description) {}
	public record Summary(String period, long completedTasks, long xpEarned, List<Activity> activity) {}
}

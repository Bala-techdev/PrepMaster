package com.prepMaster.codingPlatfom.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.prepMaster.codingPlatfom.entity.enums.Difficulty;

public final class ProgressResponses {
	private ProgressResponses() {}
	public record Progress(long completedTasks, long totalTasks, double completionRate, int currentStreak,
			int longestStreak, long totalXp, int currentLevel) {}
	public record Activity(LocalDate date, int completedTasks, long xpEarned) {}
	public record CategoryProgress(Long categoryId, String categoryName, long completedTasks, long totalQuestions) {}
	public record SolvedQuestion(Long questionId, String title, Difficulty difficulty, Instant completedAt) {}
	public record Achievement(Long id, String code, String name, String description) {}
	public record Summary(String period, long completedTasks, long xpEarned, List<Activity> activity) {}
}

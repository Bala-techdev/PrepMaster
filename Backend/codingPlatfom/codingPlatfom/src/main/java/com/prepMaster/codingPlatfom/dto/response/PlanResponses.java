package com.prepMaster.codingPlatfom.dto.response;

import java.time.*;
import java.util.List;
import com.prepMaster.codingPlatfom.entity.enums.TaskStatus;

public final class PlanResponses {
	private PlanResponses() {}
	public record Task(Long id, int order, String title, Long categoryId, TaskStatus status, int xpReward) {}
	public record Plan(Long id, LocalDate planDate, String timezone, List<Task> tasks) {}
	public record Completion(Long taskId, Instant completedAt, int xpAwarded) {}
}

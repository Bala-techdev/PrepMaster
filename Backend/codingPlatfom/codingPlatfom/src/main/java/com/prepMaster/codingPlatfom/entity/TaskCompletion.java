package com.prepMaster.codingPlatfom.entity;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "task_completions", uniqueConstraints = @UniqueConstraint(name = "uk_task_completions_user_task", columnNames = {"user_id", "task_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TaskCompletion {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private User user;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "task_id", nullable = false) private DailyPlanTask task;
	@Column(name = "completed_at", nullable = false) private Instant completedAt;
	@Column(name = "activity_date", nullable = false) private LocalDate activityDate;
	@Column(name = "xp_awarded", nullable = false) private int xpAwarded;

	public TaskCompletion(User user, DailyPlanTask task, Instant completedAt, LocalDate activityDate, int xpAwarded) {
		this.user = user; this.task = task; this.completedAt = completedAt; this.activityDate = activityDate; this.xpAwarded = xpAwarded;
	}
}

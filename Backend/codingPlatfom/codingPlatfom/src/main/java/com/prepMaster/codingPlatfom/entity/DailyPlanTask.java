package com.prepMaster.codingPlatfom.entity;

import com.prepMaster.codingPlatfom.entity.enums.TaskStatus;
import com.prepMaster.codingPlatfom.exception.BusinessRuleException;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "daily_plan_tasks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DailyPlanTask extends AuditableEntity {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "plan_id", nullable = false) private DailyPlan plan;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "category_id", nullable = false) private LearningCategory category;
	@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "question_id") private DSAQuestion question;
	@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "resource_id") private LearningResource resource;
	@Column(nullable = false, length = 240) private String title;
	@Column(name = "task_order", nullable = false) private int taskOrder;
	@Enumerated(EnumType.STRING) @Column(name = "task_status", nullable = false, length = 16) private TaskStatus status;
	@Column(name = "xp_reward", nullable = false) private int xpReward;

	public DailyPlanTask(DailyPlan plan, LearningCategory category, DSAQuestion question, LearningResource resource,
			String title, int taskOrder, TaskStatus status, int xpReward) {
		this.plan = plan; this.category = category; this.question = question; this.resource = resource;
		this.title = title; this.taskOrder = taskOrder; this.status = status; this.xpReward = xpReward;
	}
	public void complete() {
		if (status == TaskStatus.COMPLETED) throw new BusinessRuleException("Task is already completed");
		if (status == TaskStatus.LOCKED) throw new BusinessRuleException("Task prerequisite is not completed");
		status = TaskStatus.COMPLETED;
	}
	public void unlock() { if (status == TaskStatus.LOCKED) status = TaskStatus.AVAILABLE; }
}

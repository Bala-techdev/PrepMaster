package com.prepMaster.codingPlatfom.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "daily_plans")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DailyPlan extends AuditableEntity {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private User user;
	@Column(name = "plan_date", nullable = false) private LocalDate planDate;
	@Column(nullable = false, length = 64) private String timezone;
	@OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("taskOrder ASC") private List<DailyPlanTask> tasks = new ArrayList<>();

	public DailyPlan(User user, LocalDate planDate, String timezone) {
		this.user = user; this.planDate = planDate; this.timezone = timezone;
	}
	public void addTask(DailyPlanTask task) { tasks.add(task); }
}

package com.prepMaster.codingPlatfom.entity;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_activity", uniqueConstraints = @UniqueConstraint(name = "uk_user_activity_user_date", columnNames = {"user_id", "activity_date"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserActivity {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private User user;
	@Column(name = "activity_date", nullable = false) private LocalDate activityDate;
	@Column(name = "completed_tasks", nullable = false) private int completedTasks;
	@Column(name = "xp_earned", nullable = false) private long xpEarned;
	public UserActivity(User user, LocalDate date) { this.user = user; this.activityDate = date; }
	public void record(int xp) { completedTasks++; xpEarned += xp; }
}

package com.prepMaster.codingPlatfom.entity;

import java.time.LocalTime;

import com.prepMaster.codingPlatfom.entity.enums.ThemePreference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserSettings extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Setter(AccessLevel.NONE)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	@Setter(AccessLevel.NONE)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private ThemePreference theme = ThemePreference.SYSTEM;

	@Column(name = "email_notifications", nullable = false)
	private boolean emailNotifications = true;

	@Column(name = "daily_goal_minutes", nullable = false)
	private int dailyGoalMinutes = 60;

	@Column(name = "reminder_time")
	private LocalTime reminderTime;

	@Column(nullable = false, length = 64)
	private String timezone = "UTC";

	public UserSettings(User user) {
		this.user = user;
	}

	void setUser(User user) {
		this.user = user;
	}
}

package com.prepMaster.codingPlatfom.dto.request;

import java.time.LocalTime;

import com.prepMaster.codingPlatfom.entity.enums.ThemePreference;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUserSettingsRequest(

		@NotNull(message = "theme is required")
		ThemePreference theme,

		@NotNull(message = "emailNotifications is required")
		Boolean emailNotifications,

		@NotNull(message = "dailyGoalMinutes is required")
		@Min(value = 5, message = "dailyGoalMinutes must be at least 5")
		@Max(value = 1440, message = "dailyGoalMinutes must be at most 1440")
		Integer dailyGoalMinutes,

		LocalTime reminderTime,

		@NotBlank(message = "timezone is required")
		@Size(max = 64, message = "timezone must be at most 64 characters")
		String timezone
) {
}

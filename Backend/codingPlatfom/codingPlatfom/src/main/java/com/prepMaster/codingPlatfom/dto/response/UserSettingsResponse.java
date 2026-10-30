package com.prepMaster.codingPlatfom.dto.response;

import java.time.LocalTime;

import com.prepMaster.codingPlatfom.entity.enums.ThemePreference;

public record UserSettingsResponse(
		Long id,
		ThemePreference theme,
		boolean emailNotifications,
		int dailyGoalMinutes,
		LocalTime reminderTime,
		String timezone
) {
}

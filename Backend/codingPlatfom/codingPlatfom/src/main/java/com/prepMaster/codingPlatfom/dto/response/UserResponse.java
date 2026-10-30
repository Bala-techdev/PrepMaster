package com.prepMaster.codingPlatfom.dto.response;

import java.time.LocalDateTime;

import com.prepMaster.codingPlatfom.entity.enums.AccountStatus;

/**
 * Public view of an account. Deliberately contains no password hash or any
 * other credential material.
 */
public record UserResponse(
		Long id,
		String email,
		String username,
		AccountStatus status,
		LocalDateTime createdAt,
		LocalDateTime updatedAt,
		UserProfileResponse profile,
		UserSettingsResponse settings,
		UserStreakResponse streak
) {
}

package com.prepMaster.codingPlatfom.mapper;

import com.prepMaster.codingPlatfom.dto.response.UserProfileResponse;
import com.prepMaster.codingPlatfom.dto.response.UserResponse;
import com.prepMaster.codingPlatfom.dto.response.UserSettingsResponse;
import com.prepMaster.codingPlatfom.dto.response.UserStreakResponse;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.UserProfile;
import com.prepMaster.codingPlatfom.entity.UserSettings;
import com.prepMaster.codingPlatfom.entity.UserStreak;

/**
 * Manual entity-to-DTO mapping. Entities never leave the service layer, which
 * keeps lazy associations and credential fields out of the HTTP contract.
 */
public final class UserMapper {

	private UserMapper() {
	}

	public static UserResponse toResponse(User user) {
		return new UserResponse(
				user.getId(),
				user.getEmail(),
				user.getUsername(),
				user.getStatus(),
				user.getCreatedAt(),
				user.getUpdatedAt(),
				toProfileResponse(user.getProfile()),
				toSettingsResponse(user.getSettings()),
				toStreakResponse(user.getStreak())
		);
	}

	public static UserProfileResponse toProfileResponse(UserProfile profile) {
		if (profile == null) {
			return null;
		}
		return new UserProfileResponse(
				profile.getId(),
				profile.getDisplayName(),
				profile.getHeadline(),
				profile.getBio(),
				profile.getAvatarUrl(),
				profile.getLocation(),
				profile.getTargetRole(),
				profile.getExperienceLevel(),
				profile.getGithubUrl(),
				profile.getLinkedinUrl()
		);
	}

	public static UserSettingsResponse toSettingsResponse(UserSettings settings) {
		if (settings == null) {
			return null;
		}
		return new UserSettingsResponse(
				settings.getId(),
				settings.getTheme(),
				settings.isEmailNotifications(),
				settings.getDailyGoalMinutes(),
				settings.getReminderTime(),
				settings.getTimezone()
		);
	}

	public static UserStreakResponse toStreakResponse(UserStreak streak) {
		if (streak == null) {
			return null;
		}
		return new UserStreakResponse(
				streak.getId(),
				streak.getCurrentStreak(),
				streak.getLongestStreak(),
				streak.getTotalActiveDays(),
				streak.getLastActivityDate()
		);
	}
}

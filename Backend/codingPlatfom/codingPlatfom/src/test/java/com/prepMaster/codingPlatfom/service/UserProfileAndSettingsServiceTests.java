package com.prepMaster.codingPlatfom.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.CreateUserRequest;
import com.prepMaster.codingPlatfom.dto.request.UpdateUserProfileRequest;
import com.prepMaster.codingPlatfom.dto.request.UpdateUserSettingsRequest;
import com.prepMaster.codingPlatfom.dto.response.UserProfileResponse;
import com.prepMaster.codingPlatfom.dto.response.UserSettingsResponse;
import com.prepMaster.codingPlatfom.entity.enums.ExperienceLevel;
import com.prepMaster.codingPlatfom.entity.enums.ThemePreference;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;

@SpringBootTest
@Transactional
class UserProfileAndSettingsServiceTests {

	@Autowired
	private UserService userService;

	@Autowired
	private UserProfileService userProfileService;

	@Autowired
	private UserSettingsService userSettingsService;

	@Test
	void updatesProfileFields() {
		Long userId = newUser("profile-update");

		UserProfileResponse response = userProfileService.update(userId, new UpdateUserProfileRequest(
				"  Erin Stone  ",
				"  Backend engineer  ",
				"Building PrepMaster",
				"https://cdn.example.com/erin.png",
				"Dubai",
				"Java Developer",
				ExperienceLevel.MID,
				"https://github.com/erin",
				"https://linkedin.com/in/erin"
		));

		assertThat(response.displayName()).isEqualTo("Erin Stone");
		assertThat(response.headline()).isEqualTo("Backend engineer");
		assertThat(response.bio()).isEqualTo("Building PrepMaster");
		assertThat(response.avatarUrl()).isEqualTo("https://cdn.example.com/erin.png");
		assertThat(response.location()).isEqualTo("Dubai");
		assertThat(response.targetRole()).isEqualTo("Java Developer");
		assertThat(response.experienceLevel()).isEqualTo(ExperienceLevel.MID);
		assertThat(response.githubUrl()).isEqualTo("https://github.com/erin");
		assertThat(response.linkedinUrl()).isEqualTo("https://linkedin.com/in/erin");
	}

	@Test
	void blankOptionalProfileFieldsBecomeNull() {
		Long userId = newUser("profile-blank");

		UserProfileResponse response = userProfileService.update(userId, new UpdateUserProfileRequest(
				"Frank", "   ", "", "  ", null, "", null, "", "  "));

		assertThat(response.headline()).isNull();
		assertThat(response.bio()).isNull();
		assertThat(response.avatarUrl()).isNull();
		assertThat(response.location()).isNull();
		assertThat(response.targetRole()).isNull();
		assertThat(response.githubUrl()).isNull();
		assertThat(response.linkedinUrl()).isNull();
	}

	@Test
	void updatesSettings() {
		Long userId = newUser("settings-update");

		UserSettingsResponse response = userSettingsService.update(userId, new UpdateUserSettingsRequest(
				ThemePreference.DARK,
				false,
				90,
				LocalTime.of(7, 30),
				" Asia/Dubai "
		));

		assertThat(response.theme()).isEqualTo(ThemePreference.DARK);
		assertThat(response.emailNotifications()).isFalse();
		assertThat(response.dailyGoalMinutes()).isEqualTo(90);
		assertThat(response.reminderTime()).isEqualTo(LocalTime.of(7, 30));
		assertThat(response.timezone()).isEqualTo("Asia/Dubai");
	}

	@Test
	void readsBackPersistedValues() {
		Long userId = newUser("settings-read");

		userSettingsService.update(userId, new UpdateUserSettingsRequest(
				ThemePreference.LIGHT, true, 45, null, "Europe/London"));

		UserSettingsResponse reloaded = userSettingsService.getByUserId(userId);

		assertThat(reloaded.theme()).isEqualTo(ThemePreference.LIGHT);
		assertThat(reloaded.dailyGoalMinutes()).isEqualTo(45);
		assertThat(reloaded.timezone()).isEqualTo("Europe/London");
	}

	@Test
	void reportsMissingProfile() {
		assertThatThrownBy(() -> userProfileService.getByUserId(999_999L))
				.isInstanceOf(ResourceNotFoundException.class)
				.hasMessageContaining("Profile not found");
	}

	@Test
	void reportsMissingSettings() {
		assertThatThrownBy(() -> userSettingsService.getByUserId(999_999L))
				.isInstanceOf(ResourceNotFoundException.class)
				.hasMessageContaining("Settings not found");
	}

	private Long newUser(String username) {
		return userService.create(new CreateUserRequest(username + "@example.com", username, null)).id();
	}
}

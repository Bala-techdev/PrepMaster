package com.prepMaster.codingPlatfom.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import com.prepMaster.codingPlatfom.dto.request.CreateUserRequest;
import com.prepMaster.codingPlatfom.dto.request.UpdateUserSettingsRequest;
import com.prepMaster.codingPlatfom.entity.enums.ThemePreference;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

/**
 * Unit-level checks of the Bean Validation annotations. Request DTOs are not
 * wired to controllers yet, so {@code @Valid} is not exercised through MVC.
 */
class UserRequestValidationTests {

	private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

	@Test
	void acceptsAValidCreateRequest() {
		assertThat(violatedFields(new CreateUserRequest("alice@example.com", "alice_01", "Alice")))
				.isEmpty();
	}

	@Test
	void rejectsMalformedEmail() {
		assertThat(violatedFields(new CreateUserRequest("not-an-email", "alice", null)))
				.contains("email");
	}

	@Test
	void rejectsBlankAndTooShortUsernames() {
		assertThat(violatedFields(new CreateUserRequest("alice@example.com", "  ", null)))
				.contains("username");
		assertThat(violatedFields(new CreateUserRequest("alice@example.com", "ab", null)))
				.contains("username");
	}

	@Test
	void rejectsUsernameWithUnsupportedCharacters() {
		assertThat(violatedFields(new CreateUserRequest("alice@example.com", "alice smith", null)))
				.contains("username");
	}

	@Test
	void rejectsDisplayNameLongerThan80Characters() {
		assertThat(violatedFields(new CreateUserRequest("alice@example.com", "alice", "x".repeat(81))))
				.contains("displayName");
	}

	@Test
	void rejectsUnrealisticDailyGoals() {
		assertThat(violatedFields(settings(0))).contains("dailyGoalMinutes");
		assertThat(violatedFields(settings(1441))).contains("dailyGoalMinutes");
		assertThat(violatedFields(settings(60))).isEmpty();
	}

	@Test
	void rejectsMissingSettingsValues() {
		UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(null, null, null, null, " ");

		assertThat(violatedFields(request)).contains("theme", "emailNotifications", "dailyGoalMinutes", "timezone");
	}

	private static UpdateUserSettingsRequest settings(int dailyGoalMinutes) {
		return new UpdateUserSettingsRequest(ThemePreference.SYSTEM, true, dailyGoalMinutes, null, "UTC");
	}

	private Set<String> violatedFields(Object request) {
		return validator.validate(request).stream()
				.map(ConstraintViolation::getPropertyPath)
				.map(Object::toString)
				.collect(Collectors.toSet());
	}
}

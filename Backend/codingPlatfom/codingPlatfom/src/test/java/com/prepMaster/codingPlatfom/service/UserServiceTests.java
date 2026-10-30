package com.prepMaster.codingPlatfom.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.CreateUserRequest;
import com.prepMaster.codingPlatfom.dto.response.UserResponse;
import com.prepMaster.codingPlatfom.entity.enums.AccountStatus;
import com.prepMaster.codingPlatfom.entity.enums.ThemePreference;
import com.prepMaster.codingPlatfom.exception.DuplicateResourceException;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.repository.UserRepository;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@Transactional
class UserServiceTests {

	@Autowired
	private UserService userService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void createsUserWithProfileSettingsAndStreak() {
		UserResponse response = userService.create(new CreateUserRequest("  Alice@Example.COM ", "alice", null));

		assertThat(response.id()).isNotNull();
		assertThat(response.email()).isEqualTo("alice@example.com");
		assertThat(response.username()).isEqualTo("alice");
		assertThat(response.status()).isEqualTo(AccountStatus.ACTIVE);
		assertThat(response.createdAt()).isNotNull();
		assertThat(response.updatedAt()).isNotNull();

		assertThat(response.profile()).isNotNull();
		assertThat(response.profile().displayName()).isEqualTo("alice");

		assertThat(response.settings()).isNotNull();
		assertThat(response.settings().theme()).isEqualTo(ThemePreference.SYSTEM);
		assertThat(response.settings().dailyGoalMinutes()).isEqualTo(60);
		assertThat(response.settings().emailNotifications()).isTrue();
		assertThat(response.settings().timezone()).isEqualTo("UTC");

		assertThat(response.streak()).isNotNull();
		assertThat(response.streak().currentStreak()).isZero();
		assertThat(response.streak().longestStreak()).isZero();
		assertThat(response.streak().totalActiveDays()).isZero();
		assertThat(response.streak().lastActivityDate()).isNull();
	}

	@Test
	void usesProvidedDisplayNameWhenPresent() {
		UserResponse response = userService.create(new CreateUserRequest("bob@example.com", "bob", "  Bob Stone  "));

		assertThat(response.profile().displayName()).isEqualTo("Bob Stone");
	}

	@Test
	void rejectsDuplicateEmailIgnoringCase() {
		userService.create(new CreateUserRequest("alice@example.com", "alice", null));

		assertThatThrownBy(() -> userService.create(new CreateUserRequest("ALICE@example.com", "alice-two", null)))
				.isInstanceOf(DuplicateResourceException.class)
				.hasMessageContaining("Email");
	}

	@Test
	void rejectsDuplicateUsernameIgnoringCase() {
		userService.create(new CreateUserRequest("alice@example.com", "alice", null));

		assertThatThrownBy(() -> userService.create(new CreateUserRequest("other@example.com", "ALICE", null)))
				.isInstanceOf(DuplicateResourceException.class)
				.hasMessageContaining("Username");
	}

	@Test
	void findsUserByEmailCaseInsensitively() {
		userService.create(new CreateUserRequest("carol@example.com", "carol", null));

		UserResponse response = userService.getByEmail("CAROL@EXAMPLE.COM");

		assertThat(response.username()).isEqualTo("carol");
		assertThat(userRepository.findByUsernameIgnoreCase("Carol")).isPresent();
	}

	@Test
	void reportsMissingUser() {
		assertThatThrownBy(() -> userService.getById(999_999L))
				.isInstanceOf(ResourceNotFoundException.class)
				.hasMessageContaining("999999");
	}

	@Test
	void serialisedResponseContainsNoPasswordMaterial() {
		UserResponse response = userService.create(new CreateUserRequest("dave@example.com", "dave", null));

		String json = objectMapper.writeValueAsString(response).toLowerCase();

		assertThat(json).doesNotContain("password");
		assertThat(json).doesNotContain("passwordhash");
		assertThat(json).contains("\"email\":\"dave@example.com\"");
	}
}

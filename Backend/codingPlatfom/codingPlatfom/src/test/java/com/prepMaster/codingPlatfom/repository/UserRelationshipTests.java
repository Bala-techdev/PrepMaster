package com.prepMaster.codingPlatfom.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.CreateUserRequest;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.UserProfile;
import com.prepMaster.codingPlatfom.service.UserService;

@SpringBootTest
@Transactional
class UserRelationshipTests {

	@Autowired
	private UserService userService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private UserProfileRepository userProfileRepository;

	@Autowired
	private UserSettingsRepository userSettingsRepository;

	@Autowired
	private UserStreakRepository userStreakRepository;

	@Test
	void profileSettingsAndStreakBelongToTheSameUser() {
		Long userId = userService.create(new CreateUserRequest("grace@example.com", "grace", "Grace")).id();

		assertThat(userProfileRepository.findByUserId(userId)).hasValueSatisfying(
				profile -> assertThat(profile.getUser().getId()).isEqualTo(userId));
		assertThat(userSettingsRepository.findByUserId(userId)).hasValueSatisfying(
				settings -> assertThat(settings.getUser().getId()).isEqualTo(userId));
		assertThat(userStreakRepository.findByUserId(userId)).hasValueSatisfying(
				streak -> assertThat(streak.getUser().getId()).isEqualTo(userId));
	}

	@Test
	void userWithoutChildrenHasNoProfile() {
		User user = userRepository.save(new User("heidi@example.com", "heidi"));

		assertThat(userProfileRepository.findByUserId(user.getId())).isEmpty();
	}

	@Test
	void databaseRejectsASecondProfileForTheSameUser() {
		Long userId = userService.create(new CreateUserRequest("ivan@example.com", "ivan", null)).id();
		User user = userRepository.findById(userId).orElseThrow();

		UserProfile duplicate = new UserProfile(user, "Ivan Again");

		assertThatThrownBy(() -> userProfileRepository.saveAndFlush(duplicate))
				.isInstanceOf(DataIntegrityViolationException.class);
	}
}

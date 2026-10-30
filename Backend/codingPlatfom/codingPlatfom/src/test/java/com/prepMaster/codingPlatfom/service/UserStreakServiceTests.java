package com.prepMaster.codingPlatfom.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.CreateUserRequest;
import com.prepMaster.codingPlatfom.dto.response.UserStreakResponse;
import com.prepMaster.codingPlatfom.exception.BusinessRuleException;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;

@SpringBootTest
@Transactional
class UserStreakServiceTests {

	private static final LocalDate DAY_ONE = LocalDate.of(2026, 1, 1);

	@Autowired
	private UserService userService;

	@Autowired
	private UserStreakService userStreakService;

	@Test
	void firstActivityStartsTheStreak() {
		Long userId = newUser("streak-first");

		UserStreakResponse response = userStreakService.recordActivity(userId, DAY_ONE);

		assertThat(response.currentStreak()).isEqualTo(1);
		assertThat(response.longestStreak()).isEqualTo(1);
		assertThat(response.totalActiveDays()).isEqualTo(1);
		assertThat(response.lastActivityDate()).isEqualTo(DAY_ONE);
	}

	@Test
	void consecutiveDaysExtendTheStreak() {
		Long userId = newUser("streak-consecutive");

		userStreakService.recordActivity(userId, DAY_ONE);
		userStreakService.recordActivity(userId, DAY_ONE.plusDays(1));
		UserStreakResponse response = userStreakService.recordActivity(userId, DAY_ONE.plusDays(2));

		assertThat(response.currentStreak()).isEqualTo(3);
		assertThat(response.longestStreak()).isEqualTo(3);
		assertThat(response.totalActiveDays()).isEqualTo(3);
		assertThat(response.lastActivityDate()).isEqualTo(DAY_ONE.plusDays(2));
	}

	@Test
	void sameDayIsIdempotent() {
		Long userId = newUser("streak-same-day");

		userStreakService.recordActivity(userId, DAY_ONE);
		UserStreakResponse response = userStreakService.recordActivity(userId, DAY_ONE);

		assertThat(response.currentStreak()).isEqualTo(1);
		assertThat(response.totalActiveDays()).isEqualTo(1);
	}

	@Test
	void gapResetsCurrentStreakButPreservesLongest() {
		Long userId = newUser("streak-gap");

		userStreakService.recordActivity(userId, DAY_ONE);
		userStreakService.recordActivity(userId, DAY_ONE.plusDays(1));
		UserStreakResponse response = userStreakService.recordActivity(userId, DAY_ONE.plusDays(5));

		assertThat(response.currentStreak()).isEqualTo(1);
		assertThat(response.longestStreak()).isEqualTo(2);
		assertThat(response.totalActiveDays()).isEqualTo(3);
		assertThat(response.lastActivityDate()).isEqualTo(DAY_ONE.plusDays(5));
	}

	@Test
	void rejectsActivityBeforeTheLastRecordedDay() {
		Long userId = newUser("streak-backwards");
		userStreakService.recordActivity(userId, DAY_ONE.plusDays(3));

		assertThatThrownBy(() -> userStreakService.recordActivity(userId, DAY_ONE))
				.isInstanceOf(BusinessRuleException.class)
				.hasMessageContaining("before the last recorded activity date");
	}

	@Test
	void reportsMissingStreak() {
		assertThatThrownBy(() -> userStreakService.getByUserId(999_999L))
				.isInstanceOf(ResourceNotFoundException.class)
				.hasMessageContaining("Streak not found");
	}

	private Long newUser(String username) {
		return userService.create(new CreateUserRequest(username + "@example.com", username, null)).id();
	}
}

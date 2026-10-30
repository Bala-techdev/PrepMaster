package com.prepMaster.codingPlatfom.dto.response;

import java.time.LocalDate;

/**
 * Current streak values are a running aggregate maintained by
 * {@link com.prepMaster.codingPlatfom.entity.UserStreak#recordActivity(java.time.LocalDate)};
 * they are not recomputed from an activity log in this phase.
 */
public record UserStreakResponse(
		Long id,
		int currentStreak,
		int longestStreak,
		int totalActiveDays,
		LocalDate lastActivityDate
) {
}

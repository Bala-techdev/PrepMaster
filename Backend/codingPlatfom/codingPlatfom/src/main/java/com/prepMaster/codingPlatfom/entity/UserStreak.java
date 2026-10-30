package com.prepMaster.codingPlatfom.entity;

import java.time.LocalDate;
import java.util.Objects;

import com.prepMaster.codingPlatfom.exception.BusinessRuleException;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_streaks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserStreak extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Column(name = "current_streak", nullable = false)
	private int currentStreak;

	@Column(name = "longest_streak", nullable = false)
	private int longestStreak;

	@Column(name = "total_active_days", nullable = false)
	private int totalActiveDays;

	@Column(name = "last_activity_date")
	private LocalDate lastActivityDate;

	public UserStreak(User user) {
		this.user = user;
	}

	/**
	 * Records activity for a calendar day.
	 *
	 * <p>The operation is idempotent for the same day. Consecutive days extend
	 * the current streak; a gap restarts it at one. The longest streak and the
	 * count of distinct active days are never reduced.</p>
	 */
	public void recordActivity(LocalDate activityDate) {
		Objects.requireNonNull(activityDate, "activityDate must not be null");

		if (lastActivityDate != null) {
			if (activityDate.isBefore(lastActivityDate)) {
				throw new BusinessRuleException(
						"Activity date " + activityDate + " is before the last recorded activity date " + lastActivityDate);
			}
			if (activityDate.equals(lastActivityDate)) {
				return;
			}
			currentStreak = lastActivityDate.plusDays(1).equals(activityDate) ? currentStreak + 1 : 1;
		}
		else {
			currentStreak = 1;
		}

		longestStreak = Math.max(longestStreak, currentStreak);
		totalActiveDays++;
		lastActivityDate = activityDate;
	}

	void setUser(User user) {
		this.user = user;
	}
}

package com.prepMaster.codingPlatfom.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_achievements")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserAchievement {

	@EmbeddedId
	private UserAchievementId id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@MapsId("userId")
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@MapsId("achievementId")
	@JoinColumn(name = "achievement_id", nullable = false)
	private Achievement achievement;

	@Column(name = "awarded_at", nullable = false)
	private LocalDateTime awardedAt;

	public UserAchievement(User user, Achievement achievement, LocalDateTime awardedAt) {
		this.id = new UserAchievementId(user.getId(), achievement.getId());
		this.user = user;
		this.achievement = achievement;
		this.awardedAt = awardedAt;
	}
}

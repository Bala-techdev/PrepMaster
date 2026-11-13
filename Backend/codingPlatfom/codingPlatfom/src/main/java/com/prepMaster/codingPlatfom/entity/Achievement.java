package com.prepMaster.codingPlatfom.entity;

import com.prepMaster.codingPlatfom.entity.enums.AchievementCriteriaType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A reusable achievement definition. The criteria are evaluated by the backend
 * against persisted activity; clients only receive the resulting state.
 */
@Entity
@Table(name = "achievements")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Achievement {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@Column(nullable = false, unique = true, length = 80) private String code;
	@Column(nullable = false, length = 160) private String name;
	@Column(nullable = false, length = 500) private String description;
	@Enumerated(EnumType.STRING) @Column(name = "criteria_type", nullable = false, length = 40)
	private AchievementCriteriaType criteriaType = AchievementCriteriaType.MANUAL;
	@Column(name = "threshold_value", nullable = false) private int thresholdValue;
	@Column(nullable = false) private boolean active = true;
}

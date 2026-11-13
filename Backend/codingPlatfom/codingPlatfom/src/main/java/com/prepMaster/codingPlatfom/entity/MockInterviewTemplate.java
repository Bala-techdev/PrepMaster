package com.prepMaster.codingPlatfom.entity;

import com.prepMaster.codingPlatfom.entity.enums.InterviewCategory;
import com.prepMaster.codingPlatfom.entity.enums.QuestionDifficulty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A user-owned interview configuration. Starting it creates an
 * {@link InterviewSession} with server-owned timestamps.
 */
@Entity
@Table(name = "mock_interview_templates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MockInterviewTemplate extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, length = 160)
	private String title;

	@Column(length = 1000)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private InterviewCategory category;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private QuestionDifficulty difficulty;

	@Column(name = "duration_minutes", nullable = false)
	private int durationMinutes;

	public MockInterviewTemplate(User user, String title, String description, InterviewCategory category,
			QuestionDifficulty difficulty, int durationMinutes) {
		this.user = user;
		this.title = title;
		this.description = description;
		this.category = category;
		this.difficulty = difficulty;
		this.durationMinutes = durationMinutes;
	}
}

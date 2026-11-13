package com.prepMaster.codingPlatfom.entity;

import java.time.Instant;

import com.prepMaster.codingPlatfom.entity.enums.InterviewCategory;
import com.prepMaster.codingPlatfom.entity.enums.InterviewStatus;
import com.prepMaster.codingPlatfom.entity.enums.QuestionDifficulty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "interview_sessions", indexes = {
		@Index(name = "idx_interview_sessions_user_started", columnList = "user_id, started_at"),
		@Index(name = "idx_interview_sessions_user_status", columnList = "user_id, status")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InterviewSession extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "template_id", nullable = false)
	private MockInterviewTemplate template;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private InterviewCategory category;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private QuestionDifficulty difficulty;

	@Column(name = "duration_minutes", nullable = false)
	private int durationMinutes;

	@Column(name = "question_count", nullable = false)
	private int questionCount;

	@Column(name = "started_at", nullable = false)
	private Instant startedAt;

	@Column(name = "expires_at", nullable = false)
	private Instant expiresAt;

	@Column(name = "completed_at")
	private Instant completedAt;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private InterviewStatus status = InterviewStatus.IN_PROGRESS;

	@Column(name = "focus_monitoring_consented", nullable = false)
	private boolean focusMonitoringConsented;

	@Column(name = "focus_loss_count", nullable = false)
	private int focusLossCount;

	@Column(name = "total_time_seconds")
	private Long totalTimeSeconds;

	public InterviewSession(User user, MockInterviewTemplate template, int questionCount, Instant startedAt,
			Instant expiresAt, boolean focusMonitoringConsented) {
		this.user = user;
		this.template = template;
		this.category = template.getCategory();
		this.difficulty = template.getDifficulty();
		this.durationMinutes = template.getDurationMinutes();
		this.questionCount = questionCount;
		this.startedAt = startedAt;
		this.expiresAt = expiresAt;
		this.focusMonitoringConsented = focusMonitoringConsented;
		this.status = InterviewStatus.IN_PROGRESS;
	}

	public boolean isExpiredAt(Instant now) {
		return status == InterviewStatus.IN_PROGRESS && !now.isBefore(expiresAt);
	}

	public boolean isOpen() {
		return status == InterviewStatus.IN_PROGRESS;
	}

	public void changeFocusConsent(boolean consented) {
		this.focusMonitoringConsented = consented;
	}

	public void recordFocusLoss() {
		if (focusMonitoringConsented && status == InterviewStatus.IN_PROGRESS) {
			this.focusLossCount++;
		}
	}

	public void complete(Instant at) {
		this.status = InterviewStatus.COMPLETED;
		this.completedAt = at;
		this.totalTimeSeconds = Math.max(0, at.getEpochSecond() - startedAt.getEpochSecond());
	}

	public void expire(Instant at) {
		this.status = InterviewStatus.EXPIRED;
		this.completedAt = at;
		this.totalTimeSeconds = Math.max(0, at.getEpochSecond() - startedAt.getEpochSecond());
	}

	public void cancel(Instant at) {
		this.status = InterviewStatus.CANCELLED;
		this.completedAt = at;
		this.totalTimeSeconds = Math.max(0, at.getEpochSecond() - startedAt.getEpochSecond());
	}
}

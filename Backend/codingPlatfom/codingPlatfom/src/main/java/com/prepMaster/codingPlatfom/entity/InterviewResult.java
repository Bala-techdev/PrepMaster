package com.prepMaster.codingPlatfom.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "interview_results",
		uniqueConstraints = @UniqueConstraint(name = "uk_interview_results_session", columnNames = "session_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InterviewResult extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "session_id", nullable = false)
	private InterviewSession session;

	@Column(name = "questions_assigned", nullable = false)
	private int questionsAssigned;

	@Column(name = "questions_answered", nullable = false)
	private int questionsAnswered;

	@Column(name = "completion_percentage", nullable = false)
	private double completionPercentage;

	@Column(nullable = false)
	private double score;

	@Column(name = "measured_time_seconds", nullable = false)
	private long measuredTimeSeconds;

	@Column(name = "estimated_time_seconds", nullable = false)
	private long estimatedTimeSeconds;

	@Column(name = "focus_loss_count", nullable = false)
	private int focusLossCount;

	@Column(name = "overall_feedback", length = 1000)
	private String overallFeedback;

	public InterviewResult(InterviewSession session, int questionsAssigned, int questionsAnswered,
			double completionPercentage, double score, long measuredTimeSeconds, long estimatedTimeSeconds,
			int focusLossCount, String overallFeedback) {
		this.session = session;
		this.questionsAssigned = questionsAssigned;
		this.questionsAnswered = questionsAnswered;
		this.completionPercentage = completionPercentage;
		this.score = score;
		this.measuredTimeSeconds = measuredTimeSeconds;
		this.estimatedTimeSeconds = estimatedTimeSeconds;
		this.focusLossCount = focusLossCount;
		this.overallFeedback = overallFeedback;
	}
}

package com.prepMaster.codingPlatfom.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/**
 * Focus loss is only recorded after the candidate explicitly consents. The
 * event log is append-only and never contains content from other applications.
 */
@Entity
@Table(name = "interview_focus_events",
		indexes = @Index(name = "idx_interview_focus_events_session", columnList = "session_id, occurred_at"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InterviewFocusEvent {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "session_id", nullable = false)
	private InterviewSession session;

	@Column(name = "event_type", nullable = false, length = 32)
	private String eventType;

	@Column(name = "occurred_at", nullable = false)
	private Instant occurredAt;

	public InterviewFocusEvent(InterviewSession session, String eventType, Instant occurredAt) {
		this.session = session;
		this.eventType = eventType;
		this.occurredAt = occurredAt;
	}
}

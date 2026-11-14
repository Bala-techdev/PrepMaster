package com.prepMaster.codingPlatfom.entity;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A snapshot of a practice question at the moment a session starts. The
 * snapshot keeps a finished interview readable even if the source question is
 * edited later.
 */
@Entity
@Table(name = "interview_questions",
		uniqueConstraints = @UniqueConstraint(name = "uk_interview_questions_session_position",
				columnNames = { "session_id", "position" }),
		indexes = @Index(name = "idx_interview_questions_session", columnList = "session_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InterviewQuestion extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "session_id", nullable = false)
	private InterviewSession session;

	@Column(name = "dsa_question_id")
	private Long dsaQuestionId;

	@Column(name = "question_order", nullable = false)
	private int position;

	@Column(nullable = false, length = 240)
	private String title;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String prompt;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private QuestionDifficulty difficulty;

	@Column(length = 160)
	private String topic;

	@Column(name = "constraints_text", columnDefinition = "TEXT")
	private String constraintsText;

	@Column(name = "examples_text", columnDefinition = "TEXT")
	private String examplesText;

	@Column(name = "expected_time_complexity", length = 80)
	private String expectedTimeComplexity;

	@Column(name = "expected_space_complexity", length = 80)
	private String expectedSpaceComplexity;

	public InterviewQuestion(InterviewSession session, Long dsaQuestionId, int position, String title, String prompt,
			QuestionDifficulty difficulty, String topic, String constraintsText, String examplesText,
			String expectedTimeComplexity, String expectedSpaceComplexity) {
		this.session = session;
		this.dsaQuestionId = dsaQuestionId;
		this.position = position;
		this.title = title;
		this.prompt = prompt;
		this.difficulty = difficulty;
		this.topic = topic;
		this.constraintsText = constraintsText;
		this.examplesText = examplesText;
		this.expectedTimeComplexity = expectedTimeComplexity;
		this.expectedSpaceComplexity = expectedSpaceComplexity;
	}
}

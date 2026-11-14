package com.prepMaster.codingPlatfom.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "interview_answers",
		uniqueConstraints = @UniqueConstraint(name = "uk_interview_answers_question",
				columnNames = "question_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InterviewAnswer extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "session_id", nullable = false)
	private InterviewSession session;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "question_id", nullable = false)
	private InterviewQuestion question;

	@Column(name = "answer_text", columnDefinition = "TEXT")
	private String answerText;

	@Column(name = "code_text", columnDefinition = "TEXT")
	private String codeText;

	@Column(length = 32)
	private String language;

	@Column(nullable = false)
	private boolean answered;

	public InterviewAnswer(InterviewSession session, InterviewQuestion question) {
		this.session = session;
		this.question = question;
	}

	public void record(String answerText, String codeText, String language, boolean answered) {
		this.answerText = answerText;
		this.codeText = codeText;
		this.language = language;
		this.answered = answered;
	}
}

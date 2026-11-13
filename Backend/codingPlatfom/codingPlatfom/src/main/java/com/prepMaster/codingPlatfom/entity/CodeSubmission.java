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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dsa_submissions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CodeSubmission extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "question_id", nullable = false)
	private DSAQuestion question;

	@Column(nullable = false, length = 16)
	private String language;

	@Column(name = "source_code", nullable = false, columnDefinition = "LONGTEXT")
	private String sourceCode;

	@Column(nullable = false, length = 24)
	private String status;

	@Column(columnDefinition = "LONGTEXT")
	private String stdout;

	@Column(columnDefinition = "LONGTEXT")
	private String stderr;

	@Column(name = "execution_time_ms", nullable = false)
	private long executionTimeMs;

	@Column(nullable = false)
	private boolean passed;

	@Column(name = "xp_awarded", nullable = false)
	private int xpAwarded;

	public CodeSubmission(User user, DSAQuestion question, String language, String sourceCode, String status,
			String stdout, String stderr, long executionTimeMs, boolean passed, int xpAwarded) {
		this.user = user;
		this.question = question;
		this.language = language;
		this.sourceCode = sourceCode;
		this.status = status;
		this.stdout = stdout;
		this.stderr = stderr;
		this.executionTimeMs = executionTimeMs;
		this.passed = passed;
		this.xpAwarded = xpAwarded;
	}
}

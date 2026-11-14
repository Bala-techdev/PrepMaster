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
@Table(name = "resume_scans")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumeScan extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "resume_id", nullable = false)
	private Resume resume;

	@Column(name = "target_company", length = 120)
	private String targetCompany;
	@Column(name = "target_role", length = 160)
	private String targetRole;
	@Column(name = "job_description", nullable = false, columnDefinition = "LONGTEXT")
	private String jobDescription;
	@Column(name = "job_requirements", columnDefinition = "TEXT")
	private String jobRequirements;
	@Column(name = "ats_score", nullable = false)
	private int atsScore;
	@Column(name = "readiness_score", nullable = false)
	private int readinessScore;
	@Column(name = "technical_coverage", nullable = false)
	private int technicalCoverage;
	@Column(name = "matched_skills", columnDefinition = "TEXT")
	private String matchedSkills;
	@Column(name = "missing_skills", columnDefinition = "TEXT")
	private String missingSkills;
	@Column(name = "partial_skills", columnDefinition = "TEXT")
	private String partialSkills;
	@Column(columnDefinition = "TEXT")
	private String strengths;
	@Column(columnDefinition = "TEXT")
	private String recommendations;
	@Column(nullable = false, length = 24)
	private String status;
	@Column(name = "error_message", length = 500)
	private String errorMessage;

	public ResumeScan(User user, Resume resume, String targetCompany, String targetRole,
			String jobDescription, AtsResult result) {
		this.user = user;
		this.resume = resume;
		this.targetCompany = targetCompany;
		this.targetRole = targetRole;
		this.jobDescription = jobDescription;
		this.jobRequirements = result.requirements();
		this.atsScore = result.atsScore();
		this.readinessScore = result.readinessScore();
		this.technicalCoverage = result.technicalCoverage();
		this.matchedSkills = result.matched();
		this.missingSkills = result.missing();
		this.partialSkills = result.partial();
		this.strengths = result.strengths();
		this.recommendations = result.recommendations();
		this.status = "COMPLETED";
	}

	public record AtsResult(String requirements, int atsScore, int readinessScore, int technicalCoverage,
			String matched, String missing, String partial, String strengths, String recommendations) {
	}
}

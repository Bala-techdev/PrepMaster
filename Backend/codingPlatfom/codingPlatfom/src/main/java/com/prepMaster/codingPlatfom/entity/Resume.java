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
@Table(name = "resumes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Resume extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "original_name", nullable = false, length = 255)
	private String originalName;

	@Column(name = "storage_key", nullable = false, length = 255)
	private String storageKey;

	@Column(name = "content_type", nullable = false, length = 100)
	private String contentType;

	@Column(name = "file_size", nullable = false)
	private long fileSize;

	@Column(name = "sha256_hash", nullable = false, length = 128)
	private String sha256Hash;

	@Column(name = "extracted_name", length = 160)
	private String extractedName;
	@Column(name = "extracted_email", length = 255)
	private String extractedEmail;
	@Column(name = "extracted_phone", length = 80)
	private String extractedPhone;
	@Column(columnDefinition = "TEXT")
	private String education;
	@Column(name = "technical_skills", columnDefinition = "TEXT")
	private String technicalSkills;
	@Column(name = "programming_languages", columnDefinition = "TEXT")
	private String programmingLanguages;
	@Column(columnDefinition = "TEXT")
	private String frameworks;
	@Column(columnDefinition = "TEXT")
	private String databases;
	@Column(columnDefinition = "TEXT")
	private String projects;
	@Column(name = "work_experience", columnDefinition = "TEXT")
	private String workExperience;
	@Column(columnDefinition = "TEXT")
	private String certifications;
	@Column(name = "extracted_text", nullable = false, columnDefinition = "LONGTEXT")
	private String extractedText;

	public Resume(User user, String originalName, String storageKey, String contentType,
			long fileSize, String sha256Hash, ResumeExtraction extraction, String extractedText) {
		this.user = user;
		this.originalName = originalName;
		this.storageKey = storageKey;
		this.contentType = contentType;
		this.fileSize = fileSize;
		this.sha256Hash = sha256Hash;
		this.extractedName = extraction.name();
		this.extractedEmail = extraction.email();
		this.extractedPhone = extraction.phone();
		this.education = extraction.education();
		this.technicalSkills = extraction.technicalSkills();
		this.programmingLanguages = extraction.programmingLanguages();
		this.frameworks = extraction.frameworks();
		this.databases = extraction.databases();
		this.projects = extraction.projects();
		this.workExperience = extraction.workExperience();
		this.certifications = extraction.certifications();
		this.extractedText = extractedText;
	}

	public record ResumeExtraction(String name, String email, String phone, String education,
			String technicalSkills, String programmingLanguages, String frameworks, String databases,
			String projects, String workExperience, String certifications) {
	}
}

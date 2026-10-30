package com.prepMaster.codingPlatfom.entity;

import com.prepMaster.codingPlatfom.entity.enums.ExperienceLevel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProfile extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Setter(AccessLevel.NONE)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	@Setter(AccessLevel.NONE)
	private User user;

	@Column(name = "display_name", nullable = false, length = 80)
	private String displayName;

	@Column(length = 160)
	private String headline;

	@Column(length = 1000)
	private String bio;

	@Column(name = "avatar_url", length = 500)
	private String avatarUrl;

	@Column(length = 100)
	private String location;

	@Column(name = "target_role", length = 100)
	private String targetRole;

	@Enumerated(EnumType.STRING)
	@Column(name = "experience_level", length = 32)
	private ExperienceLevel experienceLevel;

	@Column(name = "github_url", length = 255)
	private String githubUrl;

	@Column(name = "linkedin_url", length = 255)
	private String linkedinUrl;

	public UserProfile(User user, String displayName) {
		this.user = user;
		this.displayName = displayName;
	}

	void setUser(User user) {
		this.user = user;
	}
}

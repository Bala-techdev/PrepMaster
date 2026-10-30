package com.prepMaster.codingPlatfom.entity;

import com.prepMaster.codingPlatfom.entity.enums.AccountStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 255)
	private String email;

	@Column(nullable = false, unique = true, length = 50)
	private String username;

	@Column(name = "password_hash", length = 255)
	private String passwordHash;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private AccountStatus status = AccountStatus.ACTIVE;

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private UserProfile profile;

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private UserSettings settings;

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private UserStreak streak;

	public User(String email, String username) {
		this.email = email;
		this.username = username;
	}

	public void attachProfile(UserProfile profile) {
		this.profile = profile;
		profile.setUser(this);
	}

	public void attachSettings(UserSettings settings) {
		this.settings = settings;
		settings.setUser(this);
	}

	public void attachStreak(UserStreak streak) {
		this.streak = streak;
		streak.setUser(this);
	}

	public void changeStatus(AccountStatus status) {
		this.status = status;
	}

	public void changePasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}
}

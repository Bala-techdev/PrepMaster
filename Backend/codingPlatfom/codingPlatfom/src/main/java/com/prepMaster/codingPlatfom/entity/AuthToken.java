package com.prepMaster.codingPlatfom.entity;

import java.time.LocalDateTime;

import com.prepMaster.codingPlatfom.entity.enums.AuthTokenType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "auth_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthToken extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "token_hash", nullable = false, unique = true, length = 128)
	private String tokenHash;

	@Enumerated(EnumType.STRING)
	@Column(name = "token_type", nullable = false, length = 32)
	private AuthTokenType tokenType;

	@Column(name = "expires_at", nullable = false)
	private LocalDateTime expiresAt;

	@Column(name = "consumed_at")
	private LocalDateTime consumedAt;

	@Column(name = "revoked_at")
	private LocalDateTime revokedAt;

	public AuthToken(User user, String tokenHash, AuthTokenType tokenType, LocalDateTime expiresAt) {
		this.user = user;
		this.tokenHash = tokenHash;
		this.tokenType = tokenType;
		this.expiresAt = expiresAt;
	}

	public boolean isUsable(LocalDateTime now) {
		return consumedAt == null && revokedAt == null && expiresAt.isAfter(now);
	}

	public void consume(LocalDateTime now) {
		this.consumedAt = now;
	}

	public void revoke(LocalDateTime now) {
		this.revokedAt = now;
	}
}

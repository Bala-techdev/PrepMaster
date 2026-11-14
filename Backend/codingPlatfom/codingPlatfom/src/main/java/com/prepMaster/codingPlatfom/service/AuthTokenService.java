package com.prepMaster.codingPlatfom.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.entity.AuthToken;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.enums.AuthTokenType;
import com.prepMaster.codingPlatfom.exception.AuthenticationException;
import com.prepMaster.codingPlatfom.repository.AuthTokenRepository;

@Service
@Transactional
public class AuthTokenService {

	private final AuthTokenRepository tokens;
	private final SecureTokenService secureTokens;
	private final long refreshDays;
	private final long oneHourMinutes;

	public AuthTokenService(AuthTokenRepository tokens, SecureTokenService secureTokens,
			@Value("${app.auth.refresh-days:30}") long refreshDays,
			@Value("${app.auth.action-token-minutes:60}") long oneHourMinutes) {
		this.tokens = tokens;
		this.secureTokens = secureTokens;
		this.refreshDays = refreshDays;
		this.oneHourMinutes = oneHourMinutes;
	}

	public IssuedToken issueRefreshToken(User user) {
		String raw = secureTokens.generate();
		Instant expiresAt = Instant.now().plusSeconds(refreshDays * 86400);
		tokens.save(new AuthToken(user, secureTokens.hash(raw), AuthTokenType.REFRESH,
				LocalDateTime.ofInstant(expiresAt, ZoneOffset.UTC)));
		return new IssuedToken(raw, expiresAt);
	}

	public RotatedToken rotateRefreshToken(String rawToken) {
		AuthToken token = findUsable(rawToken, AuthTokenType.REFRESH);
		token.revoke(now());
		return new RotatedToken(token.getUser(), issueRefreshToken(token.getUser()));
	}

	public void revokeRefreshToken(String rawToken) {
		AuthToken token = tokens.findByTokenHashAndTokenType(secureTokens.hash(rawToken), AuthTokenType.REFRESH)
				.orElse(null);
		if (token != null && token.isUsable(now())) {
			token.revoke(now());
		}
	}

	public IssuedToken issueActionToken(User user, AuthTokenType type) {
		String raw = secureTokens.generate();
		Instant expiresAt = Instant.now().plusSeconds(oneHourMinutes * 60);
		tokens.save(new AuthToken(user, secureTokens.hash(raw), type,
				LocalDateTime.ofInstant(expiresAt, ZoneOffset.UTC)));
		return new IssuedToken(raw, expiresAt);
	}

	public User consumeActionToken(String rawToken, AuthTokenType type) {
		AuthToken token = findUsable(rawToken, type);
		token.consume(now());
		return token.getUser();
	}

	private AuthToken findUsable(String rawToken, AuthTokenType type) {
		return tokens.findByTokenHashAndTokenType(secureTokens.hash(rawToken), type)
				.filter(token -> token.isUsable(now()))
				.orElseThrow(AuthenticationException::new);
	}

	private LocalDateTime now() {
		return LocalDateTime.now(ZoneOffset.UTC);
	}

	public record IssuedToken(String value, Instant expiresAt) {
	}

	public record RotatedToken(User user, IssuedToken token) {
	}
}

package com.prepMaster.codingPlatfom.security;

import java.time.Instant;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import com.prepMaster.codingPlatfom.config.JwtProperties;
import com.prepMaster.codingPlatfom.entity.User;

@Service
public class JwtService {

	private final JwtEncoder encoder;
	private final JwtProperties properties;

	public JwtService(JwtEncoder encoder, JwtProperties properties) {
		this.encoder = encoder;
		this.properties = properties;
	}

	public Token generate(User user) {
		Instant issuedAt = Instant.now();
		Instant expiresAt = issuedAt.plusSeconds(properties.expirationSeconds());
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.subject(user.getId().toString())
				.issuer("prepmaster")
				.issuedAt(issuedAt)
				.expiresAt(expiresAt)
				.claim("email", user.getEmail())
				.build();
		String token = encoder.encode(JwtEncoderParameters.from(
				JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
		return new Token(token, properties.expirationSeconds(), expiresAt);
	}

	public record Token(String value, long expiresIn, Instant expiresAt) {
	}
}

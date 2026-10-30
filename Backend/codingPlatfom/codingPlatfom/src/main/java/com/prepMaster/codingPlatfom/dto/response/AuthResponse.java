package com.prepMaster.codingPlatfom.dto.response;

import java.time.Instant;

public record AuthResponse(String tokenType, String accessToken, long expiresIn, Instant expiresAt,
		AuthUserResponse user) {
}

package com.prepMaster.codingPlatfom.dto.response;

import java.time.LocalDateTime;

public record LoginHistoryResponse(
		Long id,
		String email,
		String ipAddress,
		String userAgent,
		String deviceInfo,
		String location,
		boolean successful,
		String failureReason,
		LocalDateTime occurredAt) {
}

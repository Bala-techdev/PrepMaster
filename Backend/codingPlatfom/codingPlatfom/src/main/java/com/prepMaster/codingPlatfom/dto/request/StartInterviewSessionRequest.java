package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotNull;

public record StartInterviewSessionRequest(
		@NotNull(message = "templateId is required")
		Long templateId,
		Boolean focusMonitoringConsent
) {
}

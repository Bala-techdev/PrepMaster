package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FocusEventRequest(
		@NotBlank(message = "eventType is required")
		@Size(max = 32, message = "eventType must be at most 32 characters")
		String eventType
) {
}

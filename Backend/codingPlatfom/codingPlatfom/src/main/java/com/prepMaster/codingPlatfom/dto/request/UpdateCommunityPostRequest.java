package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCommunityPostRequest(
		@NotBlank(message = "title is required")
		@Size(min = 5, max = 160, message = "title must be between 5 and 160 characters")
		String title,

		@NotBlank(message = "body is required")
		@Size(min = 10, max = 4000, message = "body must be between 10 and 4000 characters")
		String body,

		@NotBlank(message = "topic is required")
		@Size(max = 40, message = "topic must be at most 40 characters")
		String topic
) {
}

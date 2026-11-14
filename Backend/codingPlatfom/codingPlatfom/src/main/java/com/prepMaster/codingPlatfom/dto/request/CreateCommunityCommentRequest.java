package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommunityCommentRequest(
		@NotBlank(message = "body is required")
		@Size(min = 1, max = 2000, message = "body must be between 1 and 2000 characters")
		String body
) {
}

package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Used by the service layer to create an account record. Registration endpoints
 * are intentionally not part of this phase.
 */
public record CreateUserRequest(

		@NotBlank(message = "email is required")
		@Email(message = "email must be a valid address")
		@Size(max = 255, message = "email must be at most 255 characters")
		String email,

		@NotBlank(message = "username is required")
		@Size(min = 3, max = 50, message = "username must be between 3 and 50 characters")
		@Pattern(regexp = "^[A-Za-z0-9._-]+$",
				message = "username may only contain letters, digits, dots, underscores and hyphens")
		String username,

		@Size(max = 80, message = "displayName must be at most 80 characters")
		String displayName
) {
}

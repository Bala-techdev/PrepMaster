package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
		@NotBlank(message = "displayName is required")
		@Size(max = 80, message = "displayName must be at most 80 characters")
		String displayName,
		@NotBlank(message = "email is required")
		@Size(max = 255, message = "email must be at most 255 characters")
		@Pattern(regexp = "^\\s*[^\\s@]+@[^\\s@]+\\.[^\\s@]+\\s*$",
				message = "email must be a valid address")
		String email,
		@NotBlank(message = "password is required")
		@Size(min = 8, max = 72, message = "password must be between 8 and 72 characters")
		@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
				message = "password must contain upper-case, lower-case and numeric characters")
		String password
) {
}

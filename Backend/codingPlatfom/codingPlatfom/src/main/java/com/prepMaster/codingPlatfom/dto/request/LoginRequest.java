package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequest(
		@NotBlank(message = "email is required")
		@Pattern(regexp = "^\\s*[^\\s@]+@[^\\s@]+\\.[^\\s@]+\\s*$", message = "email must be a valid address")
		String email,
		@NotBlank(message = "password is required") String password
) {
}

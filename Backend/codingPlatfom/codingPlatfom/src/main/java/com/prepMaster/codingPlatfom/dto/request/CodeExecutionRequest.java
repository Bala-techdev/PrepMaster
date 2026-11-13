package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CodeExecutionRequest(
		@NotBlank @Size(max = 16) String language,
		@NotBlank @Size(max = 100_000) String sourceCode,
		@Size(max = 50_000) String input) {
}

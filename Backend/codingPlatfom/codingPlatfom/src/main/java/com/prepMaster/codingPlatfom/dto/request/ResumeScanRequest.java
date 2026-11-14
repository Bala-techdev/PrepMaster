package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResumeScanRequest(
		@NotBlank @Size(max = 120) String targetCompany,
		@NotBlank @Size(max = 160) String targetRole,
		@NotBlank @Size(max = 50000) String jobDescription) {
}

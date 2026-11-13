package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.Size;

public record SaveInterviewAnswerRequest(
		@Size(max = 10000, message = "answerText must be at most 10000 characters")
		String answerText,

		@Size(max = 20000, message = "codeText must be at most 20000 characters")
		String codeText,

		@Size(max = 32, message = "language must be at most 32 characters")
		String language,

		Boolean answered
) {
}

package com.prepMaster.codingPlatfom.dto.request;

import com.prepMaster.codingPlatfom.entity.enums.InterviewCategory;
import com.prepMaster.codingPlatfom.entity.enums.QuestionDifficulty;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateMockInterviewRequest(
		@NotBlank(message = "title is required")
		@Size(max = 160, message = "title must be at most 160 characters")
		String title,

		@Size(max = 1000, message = "description must be at most 1000 characters")
		String description,

		@NotNull(message = "category is required")
		InterviewCategory category,

		@NotNull(message = "difficulty is required")
		QuestionDifficulty difficulty,

		@Min(value = 5, message = "durationMinutes must be at least 5")
		@Max(value = 180, message = "durationMinutes must be at most 180")
		Integer durationMinutes
) {
}

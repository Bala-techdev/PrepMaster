package com.prepMaster.codingPlatfom.dto.request;

import java.util.Set;
import com.prepMaster.codingPlatfom.entity.enums.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuestionRequest(@NotNull Long topicId, @NotBlank @Size(max = 240) String title,
		@NotBlank String description, @NotNull Difficulty difficulty, String constraints, String examples,
		@Size(max = 80) String expectedTimeComplexity, @Size(max = 80) String expectedSpaceComplexity,
		@Size(max = 1000) String practiceUrl, String testCases, Set<Long> tagIds) {
	public QuestionRequest(Long topicId, String title, String description, Difficulty difficulty, String constraints,
			String examples, String expectedTimeComplexity, String expectedSpaceComplexity, String practiceUrl,
			Set<Long> tagIds) {
		this(topicId, title, description, difficulty, constraints, examples, expectedTimeComplexity,
				expectedSpaceComplexity, practiceUrl, null, tagIds);
	}
}

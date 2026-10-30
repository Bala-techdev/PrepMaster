package com.prepMaster.codingPlatfom.dto.response;

import java.util.List;
import com.prepMaster.codingPlatfom.entity.enums.Difficulty;

public final class LearningResponses {
	private LearningResponses() {}
	public record Category(Long id, String name, String slug, boolean active) {}
	public record Topic(Long id, Long categoryId, String categoryName, String name, String slug, String description) {}
	public record Resource(Long id, Long topicId, String title, String description, String resourceUrl) {}
	public record Tag(Long id, String name, String slug) {}
	public record Question(Long id, Long topicId, String topicName, String title, String description,
			Difficulty difficulty, String constraints, String examples, String expectedTimeComplexity,
			String expectedSpaceComplexity, String practiceUrl, List<Tag> tags) {}
}

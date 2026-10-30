package com.prepMaster.codingPlatfom.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.prepMaster.codingPlatfom.dto.request.*;
import com.prepMaster.codingPlatfom.dto.response.LearningResponses.*;
import com.prepMaster.codingPlatfom.entity.*;
import com.prepMaster.codingPlatfom.entity.enums.Difficulty;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.repository.*;

@Service
@Transactional
public class LearningContentService {
	private final LearningCategoryRepository categories;
	private final LearningTopicRepository topics;
	private final LearningResourceRepository resources;
	private final DSAQuestionRepository questions;
	private final QuestionTagRepository tags;
	public LearningContentService(LearningCategoryRepository categories, LearningTopicRepository topics,
			LearningResourceRepository resources, DSAQuestionRepository questions, QuestionTagRepository tags) {
		this.categories = categories; this.topics = topics; this.resources = resources; this.questions = questions; this.tags = tags;
	}
	public Category createCategory(CategoryRequest r) { return category(categories.save(new LearningCategory(r.name().trim(), r.slug().trim()))); }
	public List<Category> categories() { return categories.findByActiveTrueOrderByNameAsc().stream().map(this::category).toList(); }
	public Category updateCategory(Long id, CategoryRequest r) { LearningCategory c = categoryEntity(id); c.update(r.name().trim(), r.slug().trim(), true); return category(c); }
	public void deleteCategory(Long id) { categoryEntity(id).deactivate(); }
	public Topic createTopic(TopicRequest r) { return topic(topics.save(new LearningTopic(categoryEntity(r.categoryId()), r.name().trim(), r.slug().trim(), r.description()))); }
	public List<Topic> topics(Long categoryId) { return topics.findByCategoryIdAndActiveTrueOrderByNameAsc(categoryId).stream().map(this::topic).toList(); }
	public List<Topic> allTopics() { return topics.findByActiveTrueOrderByNameAsc().stream().map(this::topic).toList(); }
	public Resource createResource(ResourceRequest r) { return resource(resources.save(new LearningResource(topicEntity(r.topicId()), r.title(), r.description(), r.resourceUrl()))); }
	public List<Resource> resources(Long topicId) { return resources.findByTopicIdAndActiveTrueOrderByTitleAsc(topicId).stream().map(this::resource).toList(); }
	public Tag createTag(TagRequest r) { return tag(tags.save(new QuestionTag(r.name().trim(), r.slug().trim()))); }
	public Page<Question> questions(Difficulty difficulty, Long topicId, Pageable pageable) {
		return questions(difficulty, topicId, null, pageable);
	}
	public Page<Question> questions(Difficulty difficulty, Long topicId, String search, Pageable pageable) {
		String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
		return questions.search(difficulty, topicId, normalizedSearch, pageable).map(this::question);
	}
	public Question question(Long id) {
		return question(questions.findByIdAndActiveTrue(id)
				.orElseThrow(() -> new ResourceNotFoundException("Question not found: " + id)));
	}
	public Question createQuestion(QuestionRequest r) {
		Set<QuestionTag> selected = r.tagIds() == null ? Set.of() : Set.copyOf(tags.findByIdIn(r.tagIds()));
		return question(questions.save(new DSAQuestion(topicEntity(r.topicId()), r.title(), r.description(), r.difficulty(),
				r.constraints(), r.examples(), r.expectedTimeComplexity(), r.expectedSpaceComplexity(), r.practiceUrl(), selected)));
	}
	private LearningCategory categoryEntity(Long id) { return categories.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id)); }
	private LearningTopic topicEntity(Long id) { return topics.findById(id).orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + id)); }
	private Category category(LearningCategory c) { return new Category(c.getId(), c.getName(), c.getSlug(), c.isActive()); }
	private Topic topic(LearningTopic t) { return new Topic(t.getId(), t.getCategory().getId(), t.getCategory().getName(), t.getName(), t.getSlug(), t.getDescription()); }
	private Resource resource(LearningResource r) { return new Resource(r.getId(), r.getTopic().getId(), r.getTitle(), r.getDescription(), r.getResourceUrl()); }
	private Question question(DSAQuestion q) { return new Question(q.getId(), q.getTopic().getId(), q.getTopic().getName(), q.getTitle(), q.getDescription(), q.getDifficulty(),
			q.getConstraints(), q.getExamples(), q.getExpectedTimeComplexity(), q.getExpectedSpaceComplexity(), q.getPracticeUrl(),
			q.getTags().stream().map(t -> new Tag(t.getId(), t.getName(), t.getSlug())).collect(Collectors.toList())); }
	private Tag tag(QuestionTag t) { return new Tag(t.getId(), t.getName(), t.getSlug()); }
}

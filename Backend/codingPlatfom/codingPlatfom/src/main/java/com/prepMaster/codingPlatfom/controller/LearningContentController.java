package com.prepMaster.codingPlatfom.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.prepMaster.codingPlatfom.dto.request.*;
import com.prepMaster.codingPlatfom.dto.response.LearningResponses.*;
import com.prepMaster.codingPlatfom.entity.enums.Difficulty;
import com.prepMaster.codingPlatfom.service.LearningContentService;

@RestController
@RequestMapping("/api/learning")
public class LearningContentController {
	private final LearningContentService service;
	public LearningContentController(LearningContentService service) { this.service = service; }
	@GetMapping("/categories") public java.util.List<Category> categories() { return service.categories(); }
	@PostMapping("/categories") @ResponseStatus(HttpStatus.CREATED) public Category category(@Valid @RequestBody CategoryRequest r) { return service.createCategory(r); }
	@PutMapping("/categories/{id}") public Category updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest r) { return service.updateCategory(id, r); }
	@DeleteMapping("/categories/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteCategory(@PathVariable Long id) { service.deleteCategory(id); }
	@GetMapping("/categories/{id}/topics") public java.util.List<Topic> topics(@PathVariable Long id) { return service.topics(id); }
	@GetMapping("/topics") public java.util.List<Topic> allTopics() { return service.allTopics(); }
	@PostMapping("/topics") @ResponseStatus(HttpStatus.CREATED) public Topic topic(@Valid @RequestBody TopicRequest r) { return service.createTopic(r); }
	@GetMapping("/topics/{id}/resources") public java.util.List<Resource> resources(@PathVariable Long id) { return service.resources(id); }
	@PostMapping("/resources") @ResponseStatus(HttpStatus.CREATED) public Resource resource(@Valid @RequestBody ResourceRequest r) { return service.createResource(r); }
	@PostMapping("/tags") @ResponseStatus(HttpStatus.CREATED) public Tag tag(@Valid @RequestBody TagRequest r) { return service.createTag(r); }
	@GetMapping("/questions") public Page<Question> questions(@RequestParam(required = false) Difficulty difficulty,
			@RequestParam(required = false) Long topicId, @RequestParam(required = false) String search,
			Pageable pageable) { return service.questions(difficulty, topicId, search, pageable); }
	@GetMapping("/questions/{id}") public Question question(@PathVariable Long id) { return service.question(id); }
	@PostMapping("/questions") @ResponseStatus(HttpStatus.CREATED) public Question question(@Valid @RequestBody QuestionRequest r) { return service.createQuestion(r); }
}

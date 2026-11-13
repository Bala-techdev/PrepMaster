package com.prepMaster.codingPlatfom.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.CreateMockInterviewRequest;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.CategoryOption;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Template;
import com.prepMaster.codingPlatfom.entity.MockInterviewTemplate;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.enums.InterviewCategory;
import com.prepMaster.codingPlatfom.entity.enums.QuestionDifficulty;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.repository.MockInterviewTemplateRepository;
import com.prepMaster.codingPlatfom.util.TextNormalizer;

@Service
@Transactional
public class MockInterviewService {

	public static final int DEFAULT_DURATION_MINUTES = 45;

	private final MockInterviewTemplateRepository templates;
	private final UserService users;

	public MockInterviewService(MockInterviewTemplateRepository templates, UserService users) {
		this.templates = templates;
		this.users = users;
	}

	public Template create(Long userId, CreateMockInterviewRequest request) {
		User user = users.require(userId);
		int duration = request.durationMinutes() == null ? DEFAULT_DURATION_MINUTES : request.durationMinutes();
		MockInterviewTemplate template = templates.save(new MockInterviewTemplate(
				user,
				request.title().trim(),
				TextNormalizer.trimToNull(request.description()),
				request.category(),
				request.difficulty(),
				duration));
		return toResponse(template);
	}

	@Transactional(readOnly = true)
	public List<Template> list(Long userId) {
		return templates.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public List<CategoryOption> categories() {
		return Arrays.stream(InterviewCategory.values())
				.map(category -> new CategoryOption(category.name(), category.getDisplayName()))
				.toList();
	}

	@Transactional(readOnly = true)
	public List<CategoryOption> difficulties() {
		return Arrays.stream(QuestionDifficulty.values())
				.map(difficulty -> new CategoryOption(difficulty.name(), difficulty.getDisplayName()))
				.toList();
	}

	@Transactional(readOnly = true)
	public MockInterviewTemplate requireOwned(Long templateId, Long userId) {
		return templates.findByIdAndUserId(templateId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Mock interview not found: " + templateId));
	}

	private Template toResponse(MockInterviewTemplate template) {
		return new Template(
				template.getId(),
				template.getTitle(),
				template.getDescription(),
				template.getCategory().name(),
				template.getCategory().getDisplayName(),
				template.getDifficulty().name(),
				template.getDurationMinutes(),
				template.getCreatedAt());
	}
}

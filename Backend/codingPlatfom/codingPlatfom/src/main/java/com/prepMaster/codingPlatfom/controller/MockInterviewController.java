package com.prepMaster.codingPlatfom.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.prepMaster.codingPlatfom.dto.request.CreateMockInterviewRequest;
import com.prepMaster.codingPlatfom.dto.request.FocusConsentRequest;
import com.prepMaster.codingPlatfom.dto.request.FocusEventRequest;
import com.prepMaster.codingPlatfom.dto.request.SaveInterviewAnswerRequest;
import com.prepMaster.codingPlatfom.dto.request.StartInterviewSessionRequest;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.CategoryOption;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.HistoryItem;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Paged;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Performance;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Question;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Result;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Session;
import com.prepMaster.codingPlatfom.dto.response.MockInterviewResponses.Template;
import com.prepMaster.codingPlatfom.service.InterviewSessionService;
import com.prepMaster.codingPlatfom.service.MockInterviewService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/mock-interviews")
public class MockInterviewController {

	private final MockInterviewService mockInterviews;
	private final InterviewSessionService sessions;

	public MockInterviewController(MockInterviewService mockInterviews, InterviewSessionService sessions) {
		this.mockInterviews = mockInterviews;
		this.sessions = sessions;
	}

	@GetMapping("/categories")
	public List<CategoryOption> categories() {
		return mockInterviews.categories();
	}

	@GetMapping("/difficulties")
	public List<CategoryOption> difficulties() {
		return mockInterviews.difficulties();
	}

	@GetMapping("/templates")
	public List<Template> templates(Authentication authentication) {
		return mockInterviews.list(userId(authentication));
	}

	@PostMapping("/templates")
	@ResponseStatus(HttpStatus.CREATED)
	public Template createTemplate(Authentication authentication,
			@Valid @RequestBody CreateMockInterviewRequest request) {
		return mockInterviews.create(userId(authentication), request);
	}

	@GetMapping("/sessions/active")
	public ResponseEntity<Session> active(Authentication authentication) {
		Session active = sessions.active(userId(authentication));
		return active == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(active);
	}

	@PostMapping("/sessions")
	@ResponseStatus(HttpStatus.CREATED)
	public Session start(Authentication authentication, @Valid @RequestBody StartInterviewSessionRequest request) {
		return sessions.start(userId(authentication), request);
	}

	@GetMapping("/sessions/{sessionId}")
	public Session get(Authentication authentication, @PathVariable Long sessionId) {
		return sessions.get(userId(authentication), sessionId);
	}

	@PutMapping("/sessions/{sessionId}/questions/{questionId}/answer")
	public Question saveAnswer(Authentication authentication, @PathVariable Long sessionId,
			@PathVariable Long questionId, @Valid @RequestBody SaveInterviewAnswerRequest request) {
		return sessions.saveAnswer(userId(authentication), sessionId, questionId, request);
	}

	@PostMapping("/sessions/{sessionId}/focus-consent")
	public Session focusConsent(Authentication authentication, @PathVariable Long sessionId,
			@Valid @RequestBody FocusConsentRequest request) {
		return sessions.updateFocusConsent(userId(authentication), sessionId, request.consented());
	}

	@PostMapping("/sessions/{sessionId}/focus-events")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void focusEvent(Authentication authentication, @PathVariable Long sessionId,
			@Valid @RequestBody FocusEventRequest request) {
		sessions.recordFocusEvent(userId(authentication), sessionId, request.eventType());
	}

	@PostMapping("/sessions/{sessionId}/complete")
	public Result complete(Authentication authentication, @PathVariable Long sessionId) {
		return sessions.complete(userId(authentication), sessionId);
	}

	@PostMapping("/sessions/{sessionId}/cancel")
	public Session cancel(Authentication authentication, @PathVariable Long sessionId) {
		return sessions.cancel(userId(authentication), sessionId);
	}

	@GetMapping("/sessions/{sessionId}/result")
	public Result result(Authentication authentication, @PathVariable Long sessionId) {
		return sessions.result(userId(authentication), sessionId);
	}

	@GetMapping("/history")
	public Paged<HistoryItem> history(Authentication authentication,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		Page<HistoryItem> result = sessions.history(userId(authentication), page, size);
		return new Paged<>(result.getContent(), result.getNumber(), result.getSize(),
				result.getTotalElements(), result.getTotalPages());
	}

	@GetMapping("/performance")
	public Performance performance(Authentication authentication) {
		return sessions.performance(userId(authentication));
	}

	private static Long userId(Authentication authentication) {
		return Long.parseLong(authentication.getName());
	}
}

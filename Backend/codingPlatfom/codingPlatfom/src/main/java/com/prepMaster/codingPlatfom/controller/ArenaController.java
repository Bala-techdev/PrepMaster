package com.prepMaster.codingPlatfom.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prepMaster.codingPlatfom.dto.request.CodeExecutionRequest;
import com.prepMaster.codingPlatfom.dto.response.ArenaResponses.ArenaOverview;
import com.prepMaster.codingPlatfom.dto.response.ArenaResponses.Execution;
import com.prepMaster.codingPlatfom.dto.response.ArenaResponses.Submission;
import com.prepMaster.codingPlatfom.service.ArenaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/arena")
public class ArenaController {

	private final ArenaService arena;

	public ArenaController(ArenaService arena) {
		this.arena = arena;
	}

	@GetMapping("/overview")
	public ArenaOverview overview(Authentication authentication) {
		return arena.overview(userId(authentication));
	}

	@PostMapping("/questions/{questionId}/run")
	public Execution run(Authentication authentication, @PathVariable Long questionId,
			@Valid @RequestBody CodeExecutionRequest request) {
		return arena.run(userId(authentication), questionId, request);
	}

	@PostMapping("/questions/{questionId}/submit")
	@ResponseStatus(HttpStatus.CREATED)
	public Submission submit(Authentication authentication, @PathVariable Long questionId,
			@Valid @RequestBody CodeExecutionRequest request) {
		return arena.submit(userId(authentication), questionId, request);
	}

	@GetMapping("/submissions")
	public List<Submission> submissions(Authentication authentication) {
		return arena.submissions(userId(authentication));
	}

	private long userId(Authentication authentication) {
		return Long.parseLong(authentication.getName());
	}
}

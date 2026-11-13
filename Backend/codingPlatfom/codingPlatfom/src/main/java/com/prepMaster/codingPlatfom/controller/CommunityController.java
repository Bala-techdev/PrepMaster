package com.prepMaster.codingPlatfom.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.prepMaster.codingPlatfom.dto.request.CreateCommunityCommentRequest;
import com.prepMaster.codingPlatfom.dto.request.CreateCommunityPostRequest;
import com.prepMaster.codingPlatfom.dto.request.UpdateCommunityCommentRequest;
import com.prepMaster.codingPlatfom.dto.request.UpdateCommunityPostRequest;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.Activity;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.Comment;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.LikeState;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.Paged;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.PostDetail;
import com.prepMaster.codingPlatfom.dto.response.CommunityResponses.PostSummary;
import com.prepMaster.codingPlatfom.service.CommunityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

	private final CommunityService community;

	public CommunityController(CommunityService community) {
		this.community = community;
	}

	@GetMapping("/topics")
	public List<String> topics() {
		return community.topics();
	}

	@GetMapping("/posts")
	public Paged<PostSummary> posts(Authentication authentication,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String topic,
			@RequestParam(defaultValue = "recent") String sort) {
		return community.list(userId(authentication), page, size, search, topic, sort);
	}

	@GetMapping("/posts/{postId}")
	public PostDetail post(Authentication authentication, @PathVariable Long postId) {
		return community.get(userId(authentication), postId);
	}

	@PostMapping("/posts")
	@ResponseStatus(HttpStatus.CREATED)
	public PostDetail create(Authentication authentication, @Valid @RequestBody CreateCommunityPostRequest request) {
		return community.create(userId(authentication), request);
	}

	@PutMapping("/posts/{postId}")
	public PostDetail update(Authentication authentication, @PathVariable Long postId,
			@Valid @RequestBody UpdateCommunityPostRequest request) {
		return community.update(userId(authentication), postId, request);
	}

	@DeleteMapping("/posts/{postId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(Authentication authentication, @PathVariable Long postId) {
		community.delete(userId(authentication), postId);
	}

	@PostMapping("/posts/{postId}/like")
	public LikeState toggleLike(Authentication authentication, @PathVariable Long postId) {
		return community.toggleLike(userId(authentication), postId);
	}

	@GetMapping("/posts/{postId}/comments")
	public Paged<Comment> comments(Authentication authentication, @PathVariable Long postId,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
		return community.comments(userId(authentication), postId, page, size);
	}

	@PostMapping("/posts/{postId}/comments")
	@ResponseStatus(HttpStatus.CREATED)
	public Comment addComment(Authentication authentication, @PathVariable Long postId,
			@Valid @RequestBody CreateCommunityCommentRequest request) {
		return community.addComment(userId(authentication), postId, request);
	}

	@PutMapping("/comments/{commentId}")
	public Comment updateComment(Authentication authentication, @PathVariable Long commentId,
			@Valid @RequestBody UpdateCommunityCommentRequest request) {
		return community.updateComment(userId(authentication), commentId, request);
	}

	@DeleteMapping("/comments/{commentId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteComment(Authentication authentication, @PathVariable Long commentId) {
		community.deleteComment(userId(authentication), commentId);
	}

	@GetMapping("/activity")
	public List<Activity> activity(Authentication authentication,
			@RequestParam(defaultValue = "10") int limit) {
		return community.activity(userId(authentication), limit);
	}

	private static Long userId(Authentication authentication) {
		return Long.parseLong(authentication.getName());
	}
}

package com.prepMaster.codingPlatfom.controller;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prepMaster.codingPlatfom.dto.request.UpdateUserProfileRequest;
import com.prepMaster.codingPlatfom.dto.request.UpdateUserSettingsRequest;
import com.prepMaster.codingPlatfom.dto.response.UserProfileResponse;
import com.prepMaster.codingPlatfom.dto.response.UserResponse;
import com.prepMaster.codingPlatfom.dto.response.UserSettingsResponse;
import com.prepMaster.codingPlatfom.service.UserProfileService;
import com.prepMaster.codingPlatfom.service.UserService;
import com.prepMaster.codingPlatfom.service.UserSettingsService;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;
	private final UserProfileService userProfileService;
	private final UserSettingsService userSettingsService;

	public UserController(UserService userService, UserProfileService userProfileService,
			UserSettingsService userSettingsService) {
		this.userService = userService;
		this.userProfileService = userProfileService;
		this.userSettingsService = userSettingsService;
	}

	@GetMapping("/me")
	public UserResponse me(Authentication authentication) {
		return userService.getById(userId(authentication));
	}

	@GetMapping("/me/profile")
	public UserProfileResponse profile(Authentication authentication) {
		return userProfileService.getByUserId(userId(authentication));
	}

	@PutMapping("/me/profile")
	public UserProfileResponse updateProfile(Authentication authentication,
			@Valid @RequestBody UpdateUserProfileRequest request) {
		return userProfileService.update(userId(authentication), request);
	}

	@GetMapping("/me/settings")
	public UserSettingsResponse settings(Authentication authentication) {
		return userSettingsService.getByUserId(userId(authentication));
	}

	@PutMapping("/me/settings")
	public UserSettingsResponse updateSettings(Authentication authentication,
			@Valid @RequestBody UpdateUserSettingsRequest request) {
		return userSettingsService.update(userId(authentication), request);
	}

	private long userId(Authentication authentication) {
		return Long.parseLong(authentication.getName());
	}
}

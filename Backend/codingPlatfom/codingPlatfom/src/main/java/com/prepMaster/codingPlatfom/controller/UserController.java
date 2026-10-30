package com.prepMaster.codingPlatfom.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prepMaster.codingPlatfom.dto.response.UserResponse;
import com.prepMaster.codingPlatfom.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/me")
	public UserResponse me(Authentication authentication) {
		return userService.getById(Long.valueOf(authentication.getName()));
	}
}

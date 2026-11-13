package com.prepMaster.codingPlatfom.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prepMaster.codingPlatfom.dto.response.LoginHistoryResponse;
import com.prepMaster.codingPlatfom.service.LoginHistoryService;

@RestController
@RequestMapping("/api/security")
public class SecurityController {

	private final LoginHistoryService loginHistoryService;

	public SecurityController(LoginHistoryService loginHistoryService) {
		this.loginHistoryService = loginHistoryService;
	}

	@GetMapping("/login-history")
	public List<LoginHistoryResponse> loginHistory(Authentication authentication) {
		return loginHistoryService.recent(Long.valueOf(authentication.getName()));
	}
}

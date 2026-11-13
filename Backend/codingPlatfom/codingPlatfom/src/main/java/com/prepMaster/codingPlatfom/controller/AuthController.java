package com.prepMaster.codingPlatfom.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.security.core.Authentication;

import com.prepMaster.codingPlatfom.dto.request.LoginRequest;
import com.prepMaster.codingPlatfom.dto.request.RegisterRequest;
import com.prepMaster.codingPlatfom.dto.request.RefreshTokenRequest;
import com.prepMaster.codingPlatfom.dto.request.TokenRequest;
import com.prepMaster.codingPlatfom.dto.request.ForgotPasswordRequest;
import com.prepMaster.codingPlatfom.dto.request.ResetPasswordRequest;
import com.prepMaster.codingPlatfom.dto.response.AuthResponse;
import com.prepMaster.codingPlatfom.dto.response.MessageResponse;
import com.prepMaster.codingPlatfom.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
		return authService.register(request);
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
		return authService.login(request, httpRequest);
	}

	@PostMapping("/refresh")
	public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
		return authService.refresh(request.refreshToken());
	}

	@PostMapping("/logout")
	public MessageResponse logout(@Valid @RequestBody RefreshTokenRequest request) {
		authService.logout(request.refreshToken());
		return new MessageResponse("Signed out successfully");
	}

	@PostMapping("/verify-email")
	public MessageResponse verifyEmail(@Valid @RequestBody TokenRequest request) {
		authService.verifyEmail(request.token());
		return new MessageResponse("Email verified successfully");
	}

	@PostMapping("/resend-verification")
	public MessageResponse resendVerification(Authentication authentication) {
		authService.resendVerification(Long.valueOf(authentication.getName()));
		return new MessageResponse("If the account can receive email, a verification message was sent");
	}

	@PostMapping("/forgot-password")
	public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
		authService.forgotPassword(request.email());
		return new MessageResponse("If the account exists, a password recovery message was sent");
	}

	@PostMapping("/reset-password")
	public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		authService.resetPassword(request);
		return new MessageResponse("Password reset successfully");
	}
}

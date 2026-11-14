package com.prepMaster.codingPlatfom.security;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

import com.prepMaster.codingPlatfom.dto.response.AuthResponse;
import com.prepMaster.codingPlatfom.service.AuthService;

public class GoogleOAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final AuthService authService;

	public GoogleOAuthSuccessHandler(AuthService authService) {
		this.authService = authService;
	}

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		OAuth2User googleUser = (OAuth2User) authentication.getPrincipal();
		String email = googleUser.getAttribute("email");
		String name = googleUser.getAttribute("name");
		AuthResponse tokens = authService.loginWithGoogle(email, name, request);
		String target = "/oauth/callback#accessToken=" + tokens.accessToken()
				+ "&refreshToken=" + tokens.refreshToken()
				+ "&expiresAt=" + tokens.expiresAt();
		getRedirectStrategy().sendRedirect(request, response, target);
	}
}

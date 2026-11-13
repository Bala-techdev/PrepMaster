package com.prepMaster.codingPlatfom.service;

import java.util.Locale;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.LoginRequest;
import com.prepMaster.codingPlatfom.dto.request.RegisterRequest;
import com.prepMaster.codingPlatfom.dto.response.AuthResponse;
import com.prepMaster.codingPlatfom.dto.response.AuthUserResponse;
import com.prepMaster.codingPlatfom.dto.request.ResetPasswordRequest;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.enums.AuthTokenType;
import com.prepMaster.codingPlatfom.exception.AuthenticationException;
import com.prepMaster.codingPlatfom.mapper.UserMapper;
import com.prepMaster.codingPlatfom.repository.UserRepository;
import com.prepMaster.codingPlatfom.security.JwtService;

@Service
@Transactional
public class AuthService {

	private final UserRepository userRepository;
	private final UserService userService;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthTokenService authTokenService;
	private final LoginHistoryService loginHistoryService;
	private final LoginRiskService loginRiskService;

	public AuthService(UserRepository userRepository, UserService userService, PasswordEncoder passwordEncoder,
			JwtService jwtService, AuthTokenService authTokenService, LoginHistoryService loginHistoryService,
			LoginRiskService loginRiskService) {
		this.userRepository = userRepository;
		this.userService = userService;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.authTokenService = authTokenService;
		this.loginHistoryService = loginHistoryService;
		this.loginRiskService = loginRiskService;
	}

	public AuthResponse register(RegisterRequest request) {
		if (request.confirmPassword() != null && !request.password().equals(request.confirmPassword())) {
			throw new IllegalArgumentException("Passwords do not match");
		}
		String hash = passwordEncoder.encode(request.password());
		User user = userRepository.getReferenceById(userService.register(request.email(), request.displayName(), hash).id());
		authTokenService.issueActionToken(user, AuthTokenType.EMAIL_VERIFICATION);
		return response(user);
	}

	public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest) {
		String email = request.email().trim().toLowerCase(Locale.ROOT);
		String ip = httpRequest == null ? "unknown" : httpRequest.getRemoteAddr();
		if (!loginRiskService.allow(email + ":" + ip)) {
			throw new AuthenticationException();
		}
		User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
		if (user == null || user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())
				|| user.getStatus() != com.prepMaster.codingPlatfom.entity.enums.AccountStatus.ACTIVE) {
			loginHistoryService.record(user, email, httpRequest, false, "INVALID_CREDENTIALS");
			throw new AuthenticationException();
		}
		loginHistoryService.record(user, email, httpRequest, true, null);
		return response(user);
	}

	private AuthResponse response(User user) {
		JwtService.Token token = jwtService.generate(user);
		AuthTokenService.IssuedToken refresh = authTokenService.issueRefreshToken(user);
		return new AuthResponse("Bearer", token.value(), token.expiresIn(), token.expiresAt(),
				new AuthUserResponse(user.getId(), user.getEmail(), user.getUsername(),
						UserMapper.toProfileResponse(user.getProfile()).displayName(), user.getStatus(),
						user.getRole(), user.isEmailVerified()), refresh.value(), refresh.expiresAt());
	}

	public AuthResponse refresh(String rawRefreshToken) {
		AuthTokenService.RotatedToken rotated = authTokenService.rotateRefreshToken(rawRefreshToken);
		JwtService.Token access = jwtService.generate(rotated.user());
		return new AuthResponse("Bearer", access.value(), access.expiresIn(), access.expiresAt(),
				new AuthUserResponse(rotated.user().getId(), rotated.user().getEmail(), rotated.user().getUsername(),
						UserMapper.toProfileResponse(rotated.user().getProfile()).displayName(), rotated.user().getStatus(),
						rotated.user().getRole(), rotated.user().isEmailVerified()),
				rotated.token().value(), rotated.token().expiresAt());
	}

	public void logout(String rawRefreshToken) {
		authTokenService.revokeRefreshToken(rawRefreshToken);
	}

	public void verifyEmail(String rawToken) {
		User user = authTokenService.consumeActionToken(rawToken, AuthTokenType.EMAIL_VERIFICATION);
		user.markEmailVerified();
	}

	public void resendVerification(Long userId) {
		User user = userService.require(userId);
		authTokenService.issueActionToken(user, AuthTokenType.EMAIL_VERIFICATION);
	}

	public void forgotPassword(String email) {
		userRepository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT))
				.ifPresent(user -> authTokenService.issueActionToken(user, AuthTokenType.PASSWORD_RESET));
	}

	public void resetPassword(ResetPasswordRequest request) {
		if (!request.password().equals(request.confirmPassword())) {
			throw new IllegalArgumentException("Passwords do not match");
		}
		User user = authTokenService.consumeActionToken(request.token(), AuthTokenType.PASSWORD_RESET);
		user.changePasswordHash(passwordEncoder.encode(request.password()));
	}

	public AuthResponse loginWithGoogle(String email, String displayName, HttpServletRequest request) {
		if (email == null || email.isBlank()) {
			throw new AuthenticationException();
		}
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT)).orElseGet(() -> {
			Long id = userService.register(email, displayName == null ? email : displayName, null).id();
			return userRepository.getReferenceById(id);
		});
		user.changeAuthProvider("GOOGLE");
		user.markEmailVerified();
		loginHistoryService.record(user, user.getEmail(), request, true, null);
		return response(user);
	}
}

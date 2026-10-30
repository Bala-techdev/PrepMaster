package com.prepMaster.codingPlatfom.service;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.LoginRequest;
import com.prepMaster.codingPlatfom.dto.request.RegisterRequest;
import com.prepMaster.codingPlatfom.dto.response.AuthResponse;
import com.prepMaster.codingPlatfom.dto.response.AuthUserResponse;
import com.prepMaster.codingPlatfom.entity.User;
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

	public AuthService(UserRepository userRepository, UserService userService, PasswordEncoder passwordEncoder,
			JwtService jwtService) {
		this.userRepository = userRepository;
		this.userService = userService;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	public AuthResponse register(RegisterRequest request) {
		String hash = passwordEncoder.encode(request.password());
		User user = userRepository.getReferenceById(userService.register(request.email(), request.displayName(), hash).id());
		return response(user);
	}

	public AuthResponse login(LoginRequest request) {
		User user = userRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase(Locale.ROOT))
				.orElseThrow(AuthenticationException::new);
		if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())
				|| user.getStatus() != com.prepMaster.codingPlatfom.entity.enums.AccountStatus.ACTIVE) {
			throw new AuthenticationException();
		}
		return response(user);
	}

	private AuthResponse response(User user) {
		JwtService.Token token = jwtService.generate(user);
		return new AuthResponse("Bearer", token.value(), token.expiresIn(), token.expiresAt(),
				new AuthUserResponse(user.getId(), user.getEmail(), user.getUsername(),
						UserMapper.toProfileResponse(user.getProfile()).displayName(), user.getStatus()));
	}
}

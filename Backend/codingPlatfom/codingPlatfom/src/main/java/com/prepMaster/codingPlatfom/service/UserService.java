package com.prepMaster.codingPlatfom.service;

import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.CreateUserRequest;
import com.prepMaster.codingPlatfom.dto.response.UserResponse;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.UserProfile;
import com.prepMaster.codingPlatfom.entity.UserSettings;
import com.prepMaster.codingPlatfom.entity.UserStreak;
import com.prepMaster.codingPlatfom.exception.DuplicateResourceException;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.mapper.UserMapper;
import com.prepMaster.codingPlatfom.repository.UserRepository;
import com.prepMaster.codingPlatfom.util.TextNormalizer;

@Service
@Transactional
public class UserService {

	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	/**
	 * Creates an account together with its profile, settings and streak rows in
	 * a single transaction, so a user can never exist without them.
	 */
	public UserResponse create(CreateUserRequest request) {
		String email = normalizeEmail(request.email());
		String username = request.username().trim();
		return createUser(email, username, request.displayName(), null);
	}

	public UserResponse register(String email, String displayName, String passwordHash) {
		String normalizedEmail = normalizeEmail(email);
		return createUser(normalizedEmail, usernameForEmail(normalizedEmail), displayName, passwordHash);
	}

	private UserResponse createUser(String email, String username, String displayName, String passwordHash) {
		if (userRepository.existsByEmailIgnoreCase(email)) {
			throw new DuplicateResourceException("Email is already registered: " + email);
		}
		if (userRepository.existsByUsernameIgnoreCase(username)) {
			throw new DuplicateResourceException("Username is already taken: " + username);
		}

		User user = new User(email, username);
		user.changePasswordHash(passwordHash);
		displayName = TextNormalizer.trimToNull(displayName);
		user.attachProfile(new UserProfile(user, displayName == null ? username : displayName));
		user.attachSettings(new UserSettings(user));
		user.attachStreak(new UserStreak(user));

		return UserMapper.toResponse(userRepository.save(user));
	}

	private String usernameForEmail(String email) {
		String localPart = email.substring(0, email.indexOf('@')).replaceAll("[^A-Za-z0-9._-]", "-");
		String base = localPart.isBlank() ? "user" : localPart;
		base = base.substring(0, Math.min(base.length(), 50));
		String candidate = base;
		int suffix = 2;
		while (userRepository.existsByUsernameIgnoreCase(candidate)) {
			String suffixText = "-" + suffix++;
			candidate = base.substring(0, Math.min(base.length(), 50 - suffixText.length())) + suffixText;
		}
		return candidate;
	}

	@Transactional(readOnly = true)
	public UserResponse getById(Long id) {
		return UserMapper.toResponse(userRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)));
	}

	@Transactional(readOnly = true)
	public UserResponse getByEmail(String email) {
		return UserMapper.toResponse(userRepository.findByEmailIgnoreCase(normalizeEmail(email))
				.orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email)));
	}

	private static String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}
}

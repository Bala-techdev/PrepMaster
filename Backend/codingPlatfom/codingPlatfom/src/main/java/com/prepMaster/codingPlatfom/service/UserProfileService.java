package com.prepMaster.codingPlatfom.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.UpdateUserProfileRequest;
import com.prepMaster.codingPlatfom.dto.response.UserProfileResponse;
import com.prepMaster.codingPlatfom.entity.UserProfile;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.mapper.UserMapper;
import com.prepMaster.codingPlatfom.repository.UserProfileRepository;
import com.prepMaster.codingPlatfom.util.TextNormalizer;

@Service
@Transactional
public class UserProfileService {

	private final UserProfileRepository userProfileRepository;

	public UserProfileService(UserProfileRepository userProfileRepository) {
		this.userProfileRepository = userProfileRepository;
	}

	@Transactional(readOnly = true)
	public UserProfileResponse getByUserId(Long userId) {
		return UserMapper.toProfileResponse(requireProfile(userId));
	}

	public UserProfileResponse update(Long userId, UpdateUserProfileRequest request) {
		UserProfile profile = requireProfile(userId);
		profile.setDisplayName(request.displayName().trim());
		profile.setHeadline(TextNormalizer.trimToNull(request.headline()));
		profile.setBio(TextNormalizer.trimToNull(request.bio()));
		profile.setAvatarUrl(TextNormalizer.trimToNull(request.avatarUrl()));
		profile.setLocation(TextNormalizer.trimToNull(request.location()));
		profile.setTargetRole(TextNormalizer.trimToNull(request.targetRole()));
		profile.setExperienceLevel(request.experienceLevel());
		profile.setGithubUrl(TextNormalizer.trimToNull(request.githubUrl()));
		profile.setLinkedinUrl(TextNormalizer.trimToNull(request.linkedinUrl()));
		return UserMapper.toProfileResponse(profile);
	}

	private UserProfile requireProfile(Long userId) {
		return userProfileRepository.findByUserId(userId)
				.orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));
	}
}

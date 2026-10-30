package com.prepMaster.codingPlatfom.dto.response;

import com.prepMaster.codingPlatfom.entity.enums.ExperienceLevel;

public record UserProfileResponse(
		Long id,
		String displayName,
		String headline,
		String bio,
		String avatarUrl,
		String location,
		String targetRole,
		ExperienceLevel experienceLevel,
		String githubUrl,
		String linkedinUrl
) {
}

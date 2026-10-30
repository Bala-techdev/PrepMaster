package com.prepMaster.codingPlatfom.dto.request;

import com.prepMaster.codingPlatfom.entity.enums.ExperienceLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(

		@NotBlank(message = "displayName is required")
		@Size(max = 80, message = "displayName must be at most 80 characters")
		String displayName,

		@Size(max = 160, message = "headline must be at most 160 characters")
		String headline,

		@Size(max = 1000, message = "bio must be at most 1000 characters")
		String bio,

		@Size(max = 500, message = "avatarUrl must be at most 500 characters")
		String avatarUrl,

		@Size(max = 100, message = "location must be at most 100 characters")
		String location,

		@Size(max = 100, message = "targetRole must be at most 100 characters")
		String targetRole,

		ExperienceLevel experienceLevel,

		@Size(max = 255, message = "githubUrl must be at most 255 characters")
		String githubUrl,

		@Size(max = 255, message = "linkedinUrl must be at most 255 characters")
		String linkedinUrl
) {
}

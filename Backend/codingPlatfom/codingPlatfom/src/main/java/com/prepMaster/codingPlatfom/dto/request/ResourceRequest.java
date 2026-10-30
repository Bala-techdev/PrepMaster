package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResourceRequest(@NotNull Long topicId, @NotBlank @Size(max = 240) String title,
		@Size(max = 2000) String description, @NotBlank @Size(max = 1000) String resourceUrl) {}

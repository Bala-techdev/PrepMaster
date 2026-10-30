package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TopicRequest(@NotNull Long categoryId, @NotBlank @Size(max = 160) String name,
		@NotBlank @Size(max = 160) String slug, @Size(max = 1000) String description) {}

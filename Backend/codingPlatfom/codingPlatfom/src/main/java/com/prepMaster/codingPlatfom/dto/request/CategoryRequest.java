package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(@NotBlank @Size(max = 120) String name, @NotBlank @Size(max = 120) String slug) {}

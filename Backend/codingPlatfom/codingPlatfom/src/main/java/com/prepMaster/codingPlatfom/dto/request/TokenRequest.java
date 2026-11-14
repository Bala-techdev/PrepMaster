package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotBlank;

public record TokenRequest(@NotBlank String token) {
}

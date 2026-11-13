package com.prepMaster.codingPlatfom.dto.request;

import jakarta.validation.constraints.NotNull;

public record FocusConsentRequest(@NotNull(message = "consented is required") Boolean consented) {
}

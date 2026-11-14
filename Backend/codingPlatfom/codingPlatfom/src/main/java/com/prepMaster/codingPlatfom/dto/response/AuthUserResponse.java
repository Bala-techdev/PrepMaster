package com.prepMaster.codingPlatfom.dto.response;

import com.prepMaster.codingPlatfom.entity.enums.AccountStatus;
import com.prepMaster.codingPlatfom.entity.enums.UserRole;

public record AuthUserResponse(Long id, String email, String username, String displayName,
		AccountStatus status, UserRole role, boolean emailVerified) {
}

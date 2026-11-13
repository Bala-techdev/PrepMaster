package com.prepMaster.codingPlatfom.dto.response;

import java.time.LocalDateTime;

public record ResumeHistoryResponse(Long id, String fileName, String targetCompany,
		String targetRole, int atsScore, int readinessScore, String status, LocalDateTime createdAt) {
}

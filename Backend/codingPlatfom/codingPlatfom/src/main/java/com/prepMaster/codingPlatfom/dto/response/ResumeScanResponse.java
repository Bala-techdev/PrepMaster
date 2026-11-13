package com.prepMaster.codingPlatfom.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record ResumeScanResponse(
		Long id,
		Long resumeId,
		String fileName,
		String targetCompany,
		String targetRole,
		int atsScore,
		int readinessScore,
		int technicalCoverage,
		List<String> matchedSkills,
		List<String> missingSkills,
		List<String> partialSkills,
		List<String> strengths,
		List<String> recommendations,
		String extractedName,
		String extractedEmail,
		String extractedPhone,
		LocalDateTime createdAt) {
}

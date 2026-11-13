package com.prepMaster.codingPlatfom.dto.response;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public final class MockInterviewResponses {

	private MockInterviewResponses() {
	}

	public record CategoryOption(String code, String label) {
	}

	public record Template(Long id, String title, String description, String category, String categoryLabel,
			String difficulty, int durationMinutes, LocalDateTime createdAt) {
	}

	public record Answer(String answerText, String codeText, String language, boolean answered,
			LocalDateTime updatedAt) {
	}

	public record Question(Long id, int position, String title, String prompt, String difficulty, String topic,
			String constraints, String examples, String expectedTimeComplexity, String expectedSpaceComplexity,
			Answer answer) {
	}

	public record Session(Long id, Long templateId, String title, String category, String categoryLabel,
			String difficulty, int durationMinutes, int questionCount, String status, Instant startedAt,
			Instant expiresAt, Instant completedAt, Instant serverTime, long remainingSeconds,
			boolean focusMonitoringConsented, int focusLossCount, List<Question> questions) {
	}

	public record ResultSummary(Long id, String status, String category, String categoryLabel, String difficulty,
			int questionsAssigned, int questionsAnswered, double completionPercentage, double score,
			long measuredTimeSeconds, long estimatedTimeSeconds, int focusLossCount, String overallFeedback) {
	}

	public record Result(Long id, Long sessionId, String status, String category, String categoryLabel,
			String difficulty, Instant startedAt, Instant completedAt, int questionsAssigned,
			int questionsAnswered, double completionPercentage, double score, long measuredTimeSeconds,
			long estimatedTimeSeconds, int focusLossCount, String overallFeedback, List<Question> questions) {
	}

	public record HistoryItem(Long id, String category, String categoryLabel, String difficulty, int durationMinutes,
			String status, Instant startedAt, Instant completedAt, int questionCount, int questionsAnswered,
			Double score) {
	}

	public record Performance(long totalSessions, long completedSessions, long cancelledSessions,
			long expiredSessions, long inProgressSessions, double averageCompletionPercentage,
			double averageMeasuredTimeSeconds, long totalFocusLossEvents, Instant lastSessionAt) {
	}

	public record Paged<T>(List<T> content, int page, int size, long totalElements, int totalPages) {
	}
}

package com.prepMaster.codingPlatfom.dto.response;

import java.time.Instant;
import java.util.List;

import com.prepMaster.codingPlatfom.entity.enums.NotificationType;

public final class NotificationResponses {

	private NotificationResponses() {
	}

	public record NotificationView(Long id, NotificationType type, String title, String message, String link,
			boolean read, Instant createdAt, Instant readAt) {
	}

	public record UnreadCount(long count) {
	}

	public record Paged<T>(List<T> content, int page, int size, long totalElements, int totalPages) {
	}
}

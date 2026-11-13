package com.prepMaster.codingPlatfom.dto.response;

import java.time.Instant;
import java.util.List;

public final class CommunityResponses {

	private CommunityResponses() {
	}

	public record Author(Long id, String username, String displayName, String avatarUrl) {
	}

	public record PostSummary(Long id, String title, String excerpt, String topic, Author author, long likeCount,
			long commentCount, boolean likedByMe, boolean ownedByMe, Instant createdAt, Instant updatedAt) {
	}

	public record PostDetail(Long id, String title, String body, String topic, Author author, long likeCount,
			long commentCount, boolean likedByMe, boolean ownedByMe, Instant createdAt, Instant updatedAt) {
	}

	public record Comment(Long id, Long postId, String body, Author author, boolean ownedByMe, Instant createdAt,
			Instant updatedAt) {
	}

	public record LikeState(long likeCount, boolean liked) {
	}

	public record Activity(String type, Long postId, String title, String actorName, String detail, Instant at) {
	}

	public record Paged<T>(List<T> content, int page, int size, long totalElements, int totalPages) {
	}
}

package com.prepMaster.codingPlatfom.entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class CommunityLikeId implements Serializable {

	@Column(name = "post_id")
	private Long postId;

	@Column(name = "user_id")
	private Long userId;

	protected CommunityLikeId() {
	}

	public CommunityLikeId(Long postId, Long userId) {
		this.postId = postId;
		this.userId = userId;
	}

	public Long getPostId() {
		return postId;
	}

	public Long getUserId() {
		return userId;
	}

	@Override
	public boolean equals(Object other) {
		if (this == other) return true;
		if (!(other instanceof CommunityLikeId that)) return false;
		return Objects.equals(postId, that.postId) && Objects.equals(userId, that.userId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(postId, userId);
	}
}

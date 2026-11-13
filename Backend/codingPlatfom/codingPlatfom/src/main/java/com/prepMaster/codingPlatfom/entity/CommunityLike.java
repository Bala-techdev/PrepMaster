package com.prepMaster.codingPlatfom.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "community_likes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommunityLike {

	@EmbeddedId
	private CommunityLikeId id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@MapsId("postId")
	@JoinColumn(name = "post_id", nullable = false)
	private CommunityPost post;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@MapsId("userId")
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	public CommunityLike(CommunityPost post, User user) {
		this.id = new CommunityLikeId(post.getId(), user.getId());
		this.post = post;
		this.user = user;
		this.createdAt = Instant.now();
	}
}

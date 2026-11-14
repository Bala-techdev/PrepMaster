package com.prepMaster.codingPlatfom.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "community_posts", indexes = {
		@Index(name = "idx_community_posts_created", columnList = "created_at"),
		@Index(name = "idx_community_posts_user_created", columnList = "user_id, created_at"),
		@Index(name = "idx_community_posts_topic_created", columnList = "topic, created_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommunityPost extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, length = 160)
	private String title;

	@Column(nullable = false, length = 4000)
	private String body;

	@Column(nullable = false, length = 40)
	private String topic;

	public CommunityPost(User user, String title, String body, String topic) {
		this.user = user;
		this.title = title;
		this.body = body;
		this.topic = topic;
	}

	public void update(String title, String body, String topic) {
		this.title = title;
		this.body = body;
		this.topic = topic;
	}
}

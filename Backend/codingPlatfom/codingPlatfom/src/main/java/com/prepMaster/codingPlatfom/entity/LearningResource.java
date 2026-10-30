package com.prepMaster.codingPlatfom.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "learning_resources")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LearningResource extends AuditableEntity {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "topic_id", nullable = false) private LearningTopic topic;
	@Column(nullable = false, length = 240) private String title;
	@Column(length = 2000) private String description;
	@Column(name = "resource_url", nullable = false, length = 1000) private String resourceUrl;
	@Column(nullable = false) private boolean active = true;

	public LearningResource(LearningTopic topic, String title, String description, String resourceUrl) {
		this.topic = topic; this.title = title; this.description = description; this.resourceUrl = resourceUrl;
	}
}

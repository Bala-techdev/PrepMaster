package com.prepMaster.codingPlatfom.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "learning_topics")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LearningTopic extends AuditableEntity {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "category_id", nullable = false) private LearningCategory category;
	@Column(nullable = false, length = 160) private String name;
	@Column(nullable = false, length = 160) private String slug;
	@Column(length = 1000) private String description;
	@Column(nullable = false) private boolean active = true;

	public LearningTopic(LearningCategory category, String name, String slug, String description) {
		this.category = category; this.name = name; this.slug = slug; this.description = description;
	}
}

package com.prepMaster.codingPlatfom.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "learning_categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LearningCategory extends AuditableEntity {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@Column(nullable = false, unique = true, length = 120) private String name;
	@Column(nullable = false, unique = true, length = 120) private String slug;
	@Column(nullable = false) private boolean active = true;

	public LearningCategory(String name, String slug) { this.name = name; this.slug = slug; }
	public void update(String name, String slug, boolean active) { this.name = name; this.slug = slug; this.active = active; }
	public void deactivate() { this.active = false; }
}

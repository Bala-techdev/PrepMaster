package com.prepMaster.codingPlatfom.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "question_tags")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestionTag {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@Column(nullable = false, unique = true, length = 80) private String name;
	@Column(nullable = false, unique = true, length = 80) private String slug;
	public QuestionTag(String name, String slug) { this.name = name; this.slug = slug; }
}

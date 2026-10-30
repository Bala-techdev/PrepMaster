package com.prepMaster.codingPlatfom.entity;

import java.util.LinkedHashSet;
import java.util.Set;

import com.prepMaster.codingPlatfom.entity.enums.Difficulty;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dsa_questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DSAQuestion extends AuditableEntity {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "topic_id", nullable = false) private LearningTopic topic;
	@Column(nullable = false, length = 240) private String title;
	@Column(nullable = false, columnDefinition = "TEXT") private String description;
	@Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private Difficulty difficulty;
	@Column(name = "constraints_text", columnDefinition = "TEXT") private String constraints;
	@Column(name = "examples_text", columnDefinition = "TEXT") private String examples;
	@Column(name = "expected_time_complexity", length = 80) private String expectedTimeComplexity;
	@Column(name = "expected_space_complexity", length = 80) private String expectedSpaceComplexity;
	@Column(name = "practice_url", length = 1000) private String practiceUrl;
	@Column(nullable = false) private boolean active = true;
	@ManyToMany(fetch = FetchType.LAZY) @JoinTable(name = "dsa_question_tags",
			joinColumns = @JoinColumn(name = "question_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
	private Set<QuestionTag> tags = new LinkedHashSet<>();

	public DSAQuestion(LearningTopic topic, String title, String description, Difficulty difficulty, String constraints,
			String examples, String time, String space, String practiceUrl, Set<QuestionTag> tags) {
		this.topic = topic; this.title = title; this.description = description; this.difficulty = difficulty;
		this.constraints = constraints; this.examples = examples; this.expectedTimeComplexity = time;
		this.expectedSpaceComplexity = space; this.practiceUrl = practiceUrl;
		if (tags != null) this.tags = new LinkedHashSet<>(tags);
	}
}

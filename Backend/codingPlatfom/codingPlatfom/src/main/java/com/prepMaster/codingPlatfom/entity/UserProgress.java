package com.prepMaster.codingPlatfom.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_progress")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProgress {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false, unique = true) private User user;
	@Column(name = "total_xp", nullable = false) private long totalXp;
	@Column(name = "current_level", nullable = false) private int currentLevel = 1;
	public UserProgress(User user) { this.user = user; }
	public void award(int xp, int level) { totalXp += xp; currentLevel = level; }
}

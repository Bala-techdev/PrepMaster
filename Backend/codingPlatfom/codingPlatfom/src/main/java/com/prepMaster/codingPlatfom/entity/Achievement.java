package com.prepMaster.codingPlatfom.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "achievements")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Achievement {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@Column(nullable = false, unique = true, length = 80) private String code;
	@Column(nullable = false, length = 160) private String name;
	@Column(nullable = false, length = 500) private String description;
}

package com.prepMaster.codingPlatfom.entity.enums;

public enum QuestionDifficulty {
	EASY("Easy"),
	MEDIUM("Medium"),
	HARD("Hard");

	private final String displayName;

	QuestionDifficulty(String displayName) {
		this.displayName = displayName;
	}

	public String getDisplayName() {
		return displayName;
	}
}

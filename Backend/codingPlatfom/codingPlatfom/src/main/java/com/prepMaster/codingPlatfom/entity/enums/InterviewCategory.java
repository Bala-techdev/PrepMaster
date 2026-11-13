package com.prepMaster.codingPlatfom.entity.enums;

public enum InterviewCategory {
	DATA_STRUCTURES_AND_ALGORITHMS("Data Structures and Algorithms"),
	JAVA_AND_OOP("Java and OOP"),
	DATABASE_AND_SQL("Database and SQL"),
	SYSTEM_DESIGN("System Design"),
	TECHNICAL_FUNDAMENTALS("Technical Fundamentals");

	private final String displayName;

	InterviewCategory(String displayName) {
		this.displayName = displayName;
	}

	public String getDisplayName() {
		return displayName;
	}
}

package com.prepMaster.codingPlatfom.entity.enums;

public enum InterviewStatus {
	IN_PROGRESS("In Progress"),
	COMPLETED("Completed"),
	EXPIRED("Expired"),
	CANCELLED("Cancelled");

	private final String displayName;

	InterviewStatus(String displayName) {
		this.displayName = displayName;
	}

	public String getDisplayName() {
		return displayName;
	}
}

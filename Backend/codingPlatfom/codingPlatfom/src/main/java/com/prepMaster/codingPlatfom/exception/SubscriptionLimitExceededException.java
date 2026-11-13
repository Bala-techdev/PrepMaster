package com.prepMaster.codingPlatfom.exception;

public class SubscriptionLimitExceededException extends RuntimeException {
	public SubscriptionLimitExceededException(String message) {
		super(message);
	}
}

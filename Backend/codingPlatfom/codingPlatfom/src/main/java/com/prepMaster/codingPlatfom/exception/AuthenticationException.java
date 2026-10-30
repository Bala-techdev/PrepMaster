package com.prepMaster.codingPlatfom.exception;

public class AuthenticationException extends RuntimeException {

	public AuthenticationException() {
		super("Invalid email or password");
	}
}

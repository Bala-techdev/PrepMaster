package com.prepMaster.codingPlatfom.util;

public final class TextNormalizer {

	private TextNormalizer() {
	}

	/**
	 * Trims the value and converts a blank result to {@code null}, so optional
	 * text columns never store empty strings.
	 */
	public static String trimToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}

package com.prepMaster.codingPlatfom.util;

/**
 * Community text is stored as plain text and rendered as text by the client.
 * This helper removes control characters, normalises line endings, trims and
 * collapses runs of blank lines. It deliberately does not interpret HTML.
 */
public final class CommunityText {

	private CommunityText() {
	}

	public static String clean(String value, int maxLength) {
		if (value == null) {
			return null;
		}
		String normalized = value.replace("\r\n", "\n").replace('\r', '\n');
		StringBuilder builder = new StringBuilder(normalized.length());
		for (int index = 0; index < normalized.length(); index++) {
			char character = normalized.charAt(index);
			if (character == '\n' || character == '\t' || !Character.isISOControl(character)) {
				builder.append(character);
			}
		}
		String cleaned = builder.toString().trim();
		cleaned = cleaned.replaceAll("\n{3,}", "\n\n");
		return cleaned.length() <= maxLength ? cleaned : cleaned.substring(0, maxLength).trim();
	}
}

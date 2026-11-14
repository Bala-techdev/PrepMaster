package com.prepMaster.codingPlatfom.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.prepMaster.codingPlatfom.exception.RateLimitExceededException;

/**
 * Small in-process sliding-window limiter for community writes. It is
 * intentionally dependency-free; in a multi-instance deployment it would be
 * replaced by a shared store, but it still enforces the limit for this app.
 */
@Component
public class CommunityRateLimiter {

	private static final int POST_LIMIT = 5;
	private static final int COMMENT_LIMIT = 20;
	private static final Duration WINDOW = Duration.ofMinutes(10);

	private final Map<Long, Deque<Instant>> posts = new ConcurrentHashMap<>();
	private final Map<Long, Deque<Instant>> comments = new ConcurrentHashMap<>();

	public void checkPost(Long userId) {
		check(posts, userId, POST_LIMIT, "posts");
	}

	public void checkComment(Long userId) {
		check(comments, userId, COMMENT_LIMIT, "comments");
	}

	private void check(Map<Long, Deque<Instant>> buckets, Long userId, int limit, String label) {
		Instant now = Instant.now();
		Instant cutoff = now.minus(WINDOW);
		Deque<Instant> bucket = buckets.computeIfAbsent(userId, key -> new ArrayDeque<>());
		synchronized (bucket) {
			while (!bucket.isEmpty() && bucket.peekFirst().isBefore(cutoff)) {
				bucket.pollFirst();
			}
			if (bucket.size() >= limit) {
				throw new RateLimitExceededException(
						"You are posting too many " + label + ". Please try again later.");
			}
			bucket.addLast(now);
		}
	}
}

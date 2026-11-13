package com.prepMaster.codingPlatfom.service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.security.redis-enabled", havingValue = "false", matchIfMissing = true)
public class LocalLoginRiskService implements LoginRiskService {

	private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
	private final int limit;
	private final long windowSeconds;

	public LocalLoginRiskService(@Value("${app.security.login-attempt-limit:10}") int limit,
			@Value("${app.security.login-attempt-window-seconds:900}") long windowSeconds) {
		this.limit = limit;
		this.windowSeconds = windowSeconds;
	}

	@Override
	public boolean allow(String key) {
		Window window = windows.compute(key, (ignored, current) -> {
			Instant now = Instant.now();
			if (current == null || now.isAfter(current.startedAt.plusSeconds(windowSeconds))) {
				return new Window(now, new AtomicInteger(1));
			}
			current.count.incrementAndGet();
			return current;
		});
		return window.count.get() <= limit;
	}

	private record Window(Instant startedAt, AtomicInteger count) {
	}
}

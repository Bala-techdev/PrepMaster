package com.prepMaster.codingPlatfom.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.security.redis-enabled", havingValue = "true")
public class RedisLoginRiskService implements LoginRiskService {

	private final StringRedisTemplate redis;
	private final int limit;
	private final long windowSeconds;

	public RedisLoginRiskService(StringRedisTemplate redis,
			@Value("${app.security.login-attempt-limit:10}") int limit,
			@Value("${app.security.login-attempt-window-seconds:900}") long windowSeconds) {
		this.redis = redis;
		this.limit = limit;
		this.windowSeconds = windowSeconds;
	}

	@Override
	public boolean allow(String key) {
		String redisKey = "prepmaster:auth:attempts:" + key;
		Long count = redis.opsForValue().increment(redisKey);
		if (count != null && count == 1) {
			redis.expire(redisKey, Duration.ofSeconds(windowSeconds));
		}
		return count != null && count <= limit;
	}
}

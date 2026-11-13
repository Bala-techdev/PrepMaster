package com.prepMaster.codingPlatfom.service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class LeaderboardCacheService {

	private static final Logger log = LoggerFactory.getLogger(LeaderboardCacheService.class);
	private final StringRedisTemplate redis;
	private final boolean enabled;

	public LeaderboardCacheService(StringRedisTemplate redis,
			@Value("${app.arena.redis-leaderboard-enabled:false}") boolean enabled) {
		this.redis = redis;
		this.enabled = enabled;
	}

	public void recordXp(Long userId, long totalXp, LocalDate date) {
		if (!enabled) {
			return;
		}
		try {
			redis.opsForZSet().add("prepmaster:leaderboard:all-time:xp", userId.toString(), totalXp);
			redis.opsForZSet().add("prepmaster:leaderboard:weekly:" + date.get(WeekFields.ISO.weekOfWeekBasedYear()),
					userId.toString(), totalXp);
			redis.opsForZSet().add("prepmaster:leaderboard:monthly:" + date.getYear() + "-" + date.getMonthValue(),
					userId.toString(), totalXp);
		} catch (RuntimeException exception) {
			log.warn("Redis leaderboard update failed; database leaderboard remains authoritative", exception);
		}
	}
}

package com.prepMaster.codingPlatfom.service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.response.LeaderboardResponses.Board;
import com.prepMaster.codingPlatfom.dto.response.LeaderboardResponses.Entry;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.UserProgress;
import com.prepMaster.codingPlatfom.entity.enums.AccountStatus;
import com.prepMaster.codingPlatfom.entity.enums.LeaderboardMetric;
import com.prepMaster.codingPlatfom.entity.enums.LeaderboardPeriod;
import com.prepMaster.codingPlatfom.repository.TaskCompletionRepository;
import com.prepMaster.codingPlatfom.repository.UserActivityRepository;
import com.prepMaster.codingPlatfom.repository.UserProgressRepository;
import com.prepMaster.codingPlatfom.repository.UserRepository;

/**
 * Server-side leaderboard. Values always come from persisted XP/activity/streak
 * rows; the request can choose the period and metric but can never submit a
 * score, XP amount or rank.
 */
@Service
@Transactional(readOnly = true)
public class LeaderboardService {

	private final UserRepository users;
	private final UserProgressRepository progress;
	private final UserActivityRepository activity;
	private final TaskCompletionRepository completions;

	public LeaderboardService(UserRepository users, UserProgressRepository progress, UserActivityRepository activity,
			TaskCompletionRepository completions) {
		this.users = users;
		this.progress = progress;
		this.activity = activity;
		this.completions = completions;
	}

	public Board board(Long currentUserId, LeaderboardPeriod period, LeaderboardMetric metric, int page, int size) {
		int safePage = Math.max(0, page);
		int safeSize = Math.min(50, Math.max(1, size));
		LocalDate today = LocalDate.now(ZoneOffset.UTC);
		LocalDate from = switch (period) {
			case WEEKLY -> today.minusDays(6);
			case MONTHLY -> today.minusDays(29);
			case ALL_TIME -> null;
		};

		Map<Long, Long> xpByUser = new HashMap<>();
		Map<Long, Long> tasksByUser = new HashMap<>();
		Map<Long, UserProgress> progressByUser = new HashMap<>();
		for (UserProgress row : progress.findAll()) {
			progressByUser.put(row.getUser().getId(), row);
		}

		if (period == LeaderboardPeriod.ALL_TIME) {
			progressByUser.forEach((userId, row) -> xpByUser.put(userId, row.getTotalXp()));
			for (Object[] row : completions.countAllGroupedByUser()) {
				tasksByUser.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
			}
		} else {
			for (Object[] row : activity.sumXpGroupedByUser(from, today)) {
				xpByUser.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
			}
			for (Object[] row : activity.sumCompletedTasksGroupedByUser(from, today)) {
				tasksByUser.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
			}
		}

		List<Entry> entries = new ArrayList<>();
		for (User user : users.findAll()) {
			if (user.getStatus() != AccountStatus.ACTIVE) {
				continue;
			}
			UserProgress progressRow = progressByUser.get(user.getId());
			long xp = xpByUser.getOrDefault(user.getId(), 0L);
			long tasks = tasksByUser.getOrDefault(user.getId(), 0L);
			int streak = user.getStreak() == null ? 0 : user.getStreak().getCurrentStreak();
			int level = progressRow == null ? 1 : progressRow.getCurrentLevel();
			long value = switch (metric) {
				case XP -> xp;
				case ACTIVITY -> tasks;
				case STREAK -> streak;
			};
			String username = user.getUsername();
			String displayName = user.getProfile() == null ? username : user.getProfile().getDisplayName();
			String avatarUrl = user.getProfile() == null ? null : user.getProfile().getAvatarUrl();
			entries.add(new Entry(0, user.getId(), username, displayName, avatarUrl, value, xp, tasks, streak, level,
					user.getId().equals(currentUserId)));
		}

		Comparator<Entry> comparator = Comparator.comparingLong(Entry::value).reversed()
				.thenComparing(Comparator.comparingLong(Entry::xp).reversed())
				.thenComparing(Comparator.comparingLong(Entry::completedTasks).reversed())
				.thenComparing(entry -> entry.username().toLowerCase(Locale.ROOT))
				.thenComparingLong(Entry::userId);
		entries.sort(comparator);

		List<Entry> ranked = new ArrayList<>(entries.size());
		for (int index = 0; index < entries.size(); index++) {
			Entry entry = entries.get(index);
			ranked.add(new Entry(index + 1, entry.userId(), entry.username(), entry.displayName(),
					entry.avatarUrl(), entry.value(), entry.xp(), entry.completedTasks(), entry.currentStreak(),
					entry.level(), entry.currentUser()));
		}

		int fromIndex = Math.min(ranked.size(), safePage * safeSize);
		int toIndex = Math.min(ranked.size(), fromIndex + safeSize);
		List<Entry> content = ranked.subList(fromIndex, toIndex);
		int totalPages = ranked.isEmpty() ? 0 : (int) Math.ceil((double) ranked.size() / safeSize);
		return new Board(period.name(), metric.name(), content, safePage, safeSize, ranked.size(), totalPages,
				from == null ? null : from.toString(), today.toString());
	}
}

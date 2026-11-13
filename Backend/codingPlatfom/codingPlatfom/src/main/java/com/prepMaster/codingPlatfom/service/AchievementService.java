package com.prepMaster.codingPlatfom.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.response.AchievementResponses.Overview;
import com.prepMaster.codingPlatfom.dto.response.AchievementResponses.View;
import com.prepMaster.codingPlatfom.entity.Achievement;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.UserAchievement;
import com.prepMaster.codingPlatfom.entity.UserProgress;
import com.prepMaster.codingPlatfom.entity.UserStreak;
import com.prepMaster.codingPlatfom.entity.enums.AchievementCriteriaType;
import com.prepMaster.codingPlatfom.entity.enums.InterviewStatus;
import com.prepMaster.codingPlatfom.entity.enums.NotificationType;
import com.prepMaster.codingPlatfom.repository.AchievementRepository;
import com.prepMaster.codingPlatfom.repository.CodeSubmissionRepository;
import com.prepMaster.codingPlatfom.repository.InterviewSessionRepository;
import com.prepMaster.codingPlatfom.repository.TaskCompletionRepository;
import com.prepMaster.codingPlatfom.repository.UserAchievementRepository;
import com.prepMaster.codingPlatfom.repository.UserProgressRepository;

/**
 * Evaluates achievement definitions against persisted activity and awards them.
 * The client never sends progress, earned state or XP - it only reads the
 * backend's verdict.
 */
@Service
@Transactional
public class AchievementService {

	private final AchievementRepository achievements;
	private final UserAchievementRepository earned;
	private final TaskCompletionRepository completions;
	private final UserProgressRepository progress;
	private final InterviewSessionRepository interviews;
	private final UserService users;
	private final NotificationService notifications;
	private final CodeSubmissionRepository submissions;

	public AchievementService(AchievementRepository achievements, UserAchievementRepository earned,
			TaskCompletionRepository completions, UserProgressRepository progress,
			InterviewSessionRepository interviews, UserService users, NotificationService notifications,
			CodeSubmissionRepository submissions) {
		this.achievements = achievements;
		this.earned = earned;
		this.completions = completions;
		this.progress = progress;
		this.interviews = interviews;
		this.users = users;
		this.notifications = notifications;
		this.submissions = submissions;
	}

	public Overview overview(Long userId) {
		evaluateAndAward(userId);
		User user = users.require(userId);
		Stats stats = stats(user);
		Map<Long, UserAchievement> awarded = new HashMap<>();
		for (UserAchievement row : earned.findAllForUser(userId)) {
			awarded.put(row.getAchievement().getId(), row);
		}
		List<View> views = achievements.findByActiveTrueOrderByIdAsc().stream().map(definition -> {
			UserAchievement row = awarded.get(definition.getId());
			long current = currentValue(definition.getCriteriaType(), stats);
			return new View(definition.getId(), definition.getCode(), definition.getName(),
					definition.getDescription(), definition.getCriteriaType().name(), row != null,
					row == null ? null : row.getAwardedAt().toInstant(ZoneOffset.UTC), current,
					definition.getThresholdValue());
		}).toList();
		long earnedCount = views.stream().filter(View::earned).count();
		return new Overview(views, earnedCount, views.size());
	}

	/**
	 * Idempotently awards every definition whose threshold the user has reached.
	 * Safe to call after task completion, interview completion or page load.
	 */
	public int evaluateAndAward(Long userId) {
		User user = users.require(userId);
		Stats stats = stats(user);
		int awarded = 0;
		for (Achievement definition : achievements.findByActiveTrueOrderByIdAsc()) {
			if (definition.getCriteriaType() == AchievementCriteriaType.MANUAL) {
				continue;
			}
			long current = currentValue(definition.getCriteriaType(), stats);
			if (current < definition.getThresholdValue() || definition.getThresholdValue() <= 0) {
				continue;
			}
			if (earned.existsByIdUserIdAndIdAchievementId(userId, definition.getId())) {
				continue;
			}
			earned.save(new UserAchievement(user, definition, LocalDateTime.now(ZoneOffset.UTC)));
			notifications.create(userId, NotificationType.ACHIEVEMENT_UNLOCKED,
					"Achievement unlocked: " + definition.getName(), definition.getDescription(), "/achievements",
					"ACHIEVEMENT:" + definition.getCode());
			awarded++;
		}
		return awarded;
	}

	private Stats stats(User user) {
		UserStreak streak = user.getStreak();
		long totalXp = progress.findByUserId(user.getId()).map(UserProgress::getTotalXp).orElse(0L);
		return new Stats(
				completions.countByUserId(user.getId()),
				streak == null ? 0 : streak.getLongestStreak(),
				totalXp,
				completions.countDistinctSolvedQuestions(user.getId()),
				submissions.countDistinctPassedQuestions(user.getId()),
				interviews.countByUserIdAndStatusIn(user.getId(),
						List.of(InterviewStatus.COMPLETED, InterviewStatus.EXPIRED)),
				completions.countDistinctCategories(user.getId()),
				streak == null ? 0 : streak.getTotalActiveDays());
	}

	private long currentValue(AchievementCriteriaType type, Stats stats) {
		return switch (type) {
			case TASKS_COMPLETED -> stats.tasksCompleted();
			case STREAK -> stats.longestStreak();
			case TOTAL_XP -> stats.totalXp();
			case DSA_SOLVED -> stats.dsaSolved();
			case CODE_SUBMISSIONS -> stats.codeSubmissions();
			case MOCK_COMPLETED -> stats.mockCompleted();
			case CATEGORIES_EXPLORED -> stats.categoriesExplored();
			case ACTIVE_DAYS -> stats.activeDays();
			case MANUAL -> 0;
		};
	}

	private record Stats(long tasksCompleted, int longestStreak, long totalXp, long dsaSolved, long codeSubmissions, long mockCompleted,
			long categoriesExplored, int activeDays) {
	}
}

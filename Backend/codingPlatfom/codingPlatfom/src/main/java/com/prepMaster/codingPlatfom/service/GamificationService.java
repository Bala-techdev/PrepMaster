package com.prepMaster.codingPlatfom.service;

import java.time.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.prepMaster.codingPlatfom.dto.response.PlanResponses.Completion;
import com.prepMaster.codingPlatfom.dto.response.ProgressResponses.*;
import com.prepMaster.codingPlatfom.entity.*;
import com.prepMaster.codingPlatfom.repository.*;

@Service
@Transactional
public class GamificationService {
	private final TaskCompletionRepository completions; private final UserProgressRepository progress;
	private final UserActivityRepository activity; private final UserService users; private final DailyPlanService plans;
	private final UserStreakService streaks;
	private final LearningCategoryRepository categories;
	private final DSAQuestionRepository questions;
	public GamificationService(TaskCompletionRepository completions, UserProgressRepository progress, UserActivityRepository activity,
			UserService users, DailyPlanService plans, UserStreakService streaks, DailyPlanRepository plansForUser,
			LearningCategoryRepository categories, DSAQuestionRepository questions) {
		this.completions = completions; this.progress = progress; this.activity = activity; this.users = users; this.plans = plans; this.streaks = streaks; this.plansForUser = plansForUser;
		this.categories = categories; this.questions = questions;
	}
	public Completion complete(Long userId, Long taskId) {
		TaskCompletion prior = completions.findByUserIdAndTaskId(userId, taskId).orElse(null);
		if (prior != null) return new Completion(taskId, prior.getCompletedAt(), prior.getXpAwarded());
		User user = users.require(userId); DailyPlanTask task = plans.requireTask(userId, taskId);
		task.complete();
		Instant now = Instant.now(); ZoneId zone = ZoneId.of(user.getSettings().getTimezone()); LocalDate date = now.atZone(zone).toLocalDate();
		TaskCompletion saved = completions.save(new TaskCompletion(user, task, now, date, task.getXpReward()));
		UserProgress p = progress.findByUserId(userId).orElseGet(() -> progress.save(new UserProgress(user)));
		long newXp = p.getTotalXp() + task.getXpReward();
		p.award(task.getXpReward(), levelFor(newXp));
		UserActivity a = activity.findByUserIdAndActivityDate(userId, date).orElseGet(() -> activity.save(new UserActivity(user, date)));
		a.record(task.getXpReward()); streaks.recordActivity(userId, date);
		task.getPlan().getTasks().stream().filter(t -> t.getTaskOrder() == task.getTaskOrder() + 1).findFirst().ifPresent(DailyPlanTask::unlock);
		return new Completion(taskId, saved.getCompletedAt(), saved.getXpAwarded());
	}
	@Transactional(readOnly = true)
	public Progress progress(Long userId) {
		long completed = completions.countByUserId(userId);
		long total = 0;
		for (DailyPlan p : userPlans(userId)) total += p.getTasks().size();
		UserProgress p = progress.findByUserId(userId).orElse(null);
		User user = users.require(userId);
		return new Progress(completed, total, total == 0 ? 0 : (double) completed / total,
				user.getStreak().getCurrentStreak(), user.getStreak().getLongestStreak(),
				p == null ? 0 : p.getTotalXp(), p == null ? 1 : p.getCurrentLevel());
	}
	@Transactional(readOnly = true)
	public List<Activity> activity(Long userId, LocalDate from, LocalDate to) {
		return activity.findByUserIdAndActivityDateBetweenOrderByActivityDateAsc(userId, from, to).stream()
				.map(a -> new Activity(a.getActivityDate(), a.getCompletedTasks(), a.getXpEarned())).toList();
	}
	@Transactional(readOnly = true)
	public Summary summary(Long userId, LocalDate from, LocalDate to, String period) {
		List<Activity> items = activity(userId, from, to);
		return new Summary(period, items.stream().mapToLong(Activity::completedTasks).sum(),
				items.stream().mapToLong(Activity::xpEarned).sum(), items);
	}
	@Transactional(readOnly = true)
	public List<CategoryProgress> categoryProgress(Long userId) {
		Map<Long, Long> completedByCategory = completions.findByUserIdOrderByCompletedAtDesc(userId).stream()
				.collect(Collectors.groupingBy(c -> c.getTask().getCategory().getId(), Collectors.counting()));
		return categories.findByActiveTrueOrderByNameAsc().stream()
				.map(c -> new CategoryProgress(c.getId(), c.getName(), completedByCategory.getOrDefault(c.getId(), 0L),
						questions.countByTopicCategoryIdAndActiveTrue(c.getId())))
				.toList();
	}
	@Transactional(readOnly = true)
	public List<SolvedQuestion> solvedQuestions(Long userId) {
		return completions.findByUserIdOrderByCompletedAtDesc(userId).stream()
				.filter(c -> c.getTask().getQuestion() != null)
				.map(c -> {
					DSAQuestion q = c.getTask().getQuestion();
					return new SolvedQuestion(q.getId(), q.getTitle(), q.getDifficulty(), c.getCompletedAt());
				})
				.toList();
	}
	private List<DailyPlan> userPlans(Long userId) { return plansForUser.findByUserId(userId); }
	private final DailyPlanRepository plansForUser;
	public static int levelFor(long xp) { return (int) Math.max(1, Math.sqrt(xp / 100.0) + 1); }
}

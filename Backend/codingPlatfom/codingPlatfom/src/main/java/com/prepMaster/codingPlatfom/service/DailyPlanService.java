package com.prepMaster.codingPlatfom.service;

import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.prepMaster.codingPlatfom.dto.request.DailyPlanRequest;
import com.prepMaster.codingPlatfom.dto.response.PlanResponses.*;
import com.prepMaster.codingPlatfom.entity.*;
import com.prepMaster.codingPlatfom.entity.enums.TaskStatus;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.repository.*;

@Service
@Transactional
public class DailyPlanService {
	private final DailyPlanRepository plans; private final DailyPlanTaskRepository tasks; private final LearningCategoryRepository categories;
	private final LearningPlanQuestionRepository questions; private final UserService users;
	public DailyPlanService(DailyPlanRepository plans, DailyPlanTaskRepository tasks, LearningCategoryRepository categories,
			LearningPlanQuestionRepository questions, UserService users) { this.plans = plans; this.tasks = tasks; this.categories = categories; this.questions = questions; this.users = users; }
	public Plan generate(Long userId, DailyPlanRequest request) {
		User user = users.require(userId); ZoneId zone = ZoneId.of(user.getSettings().getTimezone());
		LocalDate date = LocalDate.now(zone);
		Optional<DailyPlan> existing = plans.findByUserIdAndPlanDate(userId, date);
		if (existing.isPresent()) return plan(existing.get());
		List<Long> ids = request.categoryIds() == null || request.categoryIds().isEmpty()
				? categories.findByActiveTrueOrderByNameAsc().stream().map(LearningCategory::getId).toList() : new ArrayList<>(request.categoryIds());
		List<DSAQuestion> content = questions.findByTopicCategoryIdInAndActiveTrue(ids);
		if (content.isEmpty()) throw new ResourceNotFoundException("No active learning content is available");
		DailyPlan daily = new DailyPlan(user, date, zone.getId());
		for (int i = 0; i < request.taskCount(); i++) {
			DSAQuestion q = content.get(i % content.size());
			daily.addTask(new DailyPlanTask(daily, q.getTopic().getCategory(), q, null, q.getTitle(), i + 1,
					i == 0 ? TaskStatus.AVAILABLE : TaskStatus.LOCKED, xp(q)));
		}
		return plan(plans.save(daily));
	}
	@Transactional(readOnly = true) public Plan get(Long userId, Long planId) {
		DailyPlan p = plans.findById(planId).orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + planId));
		if (!p.getUser().getId().equals(userId)) throw new ResourceNotFoundException("Plan not found: " + planId);
		return plan(p);
	}
	public DailyPlanTask requireTask(Long userId, Long taskId) {
		return tasks.findByIdAndPlanUserId(taskId, userId).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));
	}
	private int xp(DSAQuestion q) { return switch (q.getDifficulty()) { case EASY -> 10; case MEDIUM -> 25; case HARD -> 50; }; }
	private Plan plan(DailyPlan p) { return new Plan(p.getId(), p.getPlanDate(), p.getTimezone(), p.getTasks().stream().map(t -> new Task(t.getId(), t.getTaskOrder(), t.getTitle(), t.getCategory().getId(), t.getStatus(), t.getXpReward())).toList()); }
}

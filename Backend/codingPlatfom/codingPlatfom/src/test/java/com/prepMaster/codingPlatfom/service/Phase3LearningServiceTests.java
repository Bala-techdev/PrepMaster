package com.prepMaster.codingPlatfom.service;

import static org.assertj.core.api.Assertions.*;

import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import com.prepMaster.codingPlatfom.dto.request.*;
import com.prepMaster.codingPlatfom.dto.response.LearningResponses.*;
import com.prepMaster.codingPlatfom.dto.response.PlanResponses.*;
import com.prepMaster.codingPlatfom.dto.response.ProgressResponses.Progress;
import com.prepMaster.codingPlatfom.entity.enums.*;

@SpringBootTest
@Transactional
class Phase3LearningServiceTests {
	@Autowired private LearningContentService content;
	@Autowired private DailyPlanService plans;
	@Autowired private GamificationService gamification;
	@Autowired private UserService users;

	@Test
	void createsContentAndFiltersQuestions() {
		Category category = content.createCategory(new CategoryRequest("Data Structures and Algorithms", "dsa"));
		Topic topic = content.createTopic(new TopicRequest(category.id(), "Arrays", "arrays", "Array problems"));
		content.createQuestion(new QuestionRequest(topic.id(), "Two Sum", "Find a pair", Difficulty.EASY,
				"n <= 100", "Input [2,7]", "O(n)", "O(n)", "https://example.com", Set.of()));
		assertThat(content.questions(Difficulty.EASY, topic.id(), org.springframework.data.domain.PageRequest.of(0, 10)))
				.singleElement().satisfies(q -> assertThat(q.title()).isEqualTo("Two Sum"));
	}

	@Test
	void generatesSequentialPlanAndAwardsCompletionOnlyOnce() {
		Long userId = users.create(new CreateUserRequest("phase3@example.com", "phase3", "Phase 3")).id();
		Category category = content.createCategory(new CategoryRequest("System Design", "system-design"));
		Topic topic = content.createTopic(new TopicRequest(category.id(), "Scalability", "scalability", null));
		content.createQuestion(new QuestionRequest(topic.id(), "Scale API", "Design it", Difficulty.MEDIUM,
				null, null, "O(n)", "O(1)", null, Set.of()));
		Plan plan = plans.generate(userId, new DailyPlanRequest(2, Set.of(category.id())));
		assertThat(plan.tasks()).hasSize(2);
		assertThat(plan.tasks().get(0).status()).isEqualTo(TaskStatus.AVAILABLE);
		assertThat(plan.tasks().get(1).status()).isEqualTo(TaskStatus.LOCKED);

		Completion first = gamification.complete(userId, plan.tasks().get(0).id());
		Completion repeated = gamification.complete(userId, plan.tasks().get(0).id());
		assertThat(repeated.completedAt()).isEqualTo(first.completedAt());
		assertThat(gamification.progress(userId).totalXp()).isEqualTo(25);
		assertThat(plans.get(userId, plan.id()).tasks().get(1).status()).isEqualTo(TaskStatus.AVAILABLE);
		gamification.complete(userId, plan.tasks().get(1).id());
		Progress progress = gamification.progress(userId);
		assertThat(progress.completedTasks()).isEqualTo(2);
		assertThat(progress.currentStreak()).isEqualTo(1);
		assertThat(progress.longestStreak()).isEqualTo(1);
	}
}

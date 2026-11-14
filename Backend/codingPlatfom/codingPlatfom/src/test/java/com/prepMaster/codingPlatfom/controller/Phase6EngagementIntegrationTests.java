package com.prepMaster.codingPlatfom.controller;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.LinkedHashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.UserProgress;
import com.prepMaster.codingPlatfom.repository.NotificationRepository;
import com.prepMaster.codingPlatfom.repository.UserAchievementRepository;
import com.prepMaster.codingPlatfom.repository.UserProgressRepository;
import com.prepMaster.codingPlatfom.repository.UserRepository;

import jakarta.persistence.EntityManager;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class Phase6EngagementIntegrationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository users;

	@Autowired
	private UserProgressRepository progress;

	@Autowired
	private NotificationRepository notifications;

	@Autowired
	private UserAchievementRepository userAchievements;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private EntityManager entityManager;

	@Test
	void leaderboardUsesServerSideActivityAndHidesPrivateData() throws Exception {
		String alphaEmail = "phase6-lb-alpha@example.com";
		String betaEmail = "phase6-lb-beta@example.com";
		String gammaEmail = "phase6-lb-gamma@example.com";
		String alpha = register(alphaEmail, "Leader Alpha");
		String beta = register(betaEmail, "Leader Beta");
		String gamma = register(gammaEmail, "Leader Gamma");

		JsonNode alphaPlan = generatePlan(alpha, 2);
		long alphaXp = completeTask(alpha, alphaPlan.get("tasks").get(0).get("id").asLong());
		JsonNode refreshedAlphaPlan = getPlan(alpha);
		alphaXp += completeTask(alpha, refreshedAlphaPlan.get("tasks").get(1).get("id").asLong());

		JsonNode betaPlan = generatePlan(beta, 1);
		long betaXp = completeTask(beta, betaPlan.get("tasks").get(0).get("id").asLong());

		JsonNode activityBoard = board(alpha, "ALL_TIME", "ACTIVITY", 0, 50);
		JsonNode alphaEntry = entry(activityBoard, "phase6-lb-alpha");
		JsonNode betaEntry = entry(activityBoard, "phase6-lb-beta");
		JsonNode gammaEntry = entry(activityBoard, "phase6-lb-gamma");

		assertEquals(2, alphaEntry.get("value").asLong());
		assertEquals(1, betaEntry.get("value").asLong());
		assertEquals(0, gammaEntry.get("value").asLong());
		assertTrue(alphaEntry.get("rank").asInt() < betaEntry.get("rank").asInt());
		assertTrue(betaEntry.get("rank").asInt() < gammaEntry.get("rank").asInt());
		assertTrue(alphaEntry.get("currentUser").asBoolean());
		assertFalse(betaEntry.get("currentUser").asBoolean());
		assertFalse(alphaEntry.has("email"));
		assertEquals(alphaXp, entry(activityBoard, "phase6-lb-alpha").get("xp").asLong());

		JsonNode weeklyXp = board(alpha, "WEEKLY", "XP", 0, 50);
		assertEquals(alphaXp, entry(weeklyXp, "phase6-lb-alpha").get("value").asLong());
		assertEquals(betaXp, entry(weeklyXp, "phase6-lb-beta").get("value").asLong());
		assertEquals("WEEKLY", weeklyXp.get("period").asText());
		assertEquals("XP", weeklyXp.get("metric").asText());
		assertFalse(weeklyXp.get("from").isNull());
		assertFalse(weeklyXp.get("to").isNull());

		JsonNode monthlyStreak = board(alpha, "MONTHLY", "STREAK", 0, 50);
		assertGreaterThanOrEqual(1, entry(monthlyStreak, "phase6-lb-alpha").get("value").asLong());
		assertEquals(0, entry(monthlyStreak, "phase6-lb-gamma").get("value").asLong());

		mockMvc.perform(get("/api/leaderboard")
				.param("period", "ALL_TIME")
				.param("metric", "ACTIVITY")
				.param("page", "0")
				.param("size", "1")
				.header(HttpHeaders.AUTHORIZATION, bearer(alpha)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(1)))
				.andExpect(jsonPath("$.content[0].rank").value(1))
				.andExpect(jsonPath("$.content[0].email").doesNotExist())
				.andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(3)));

		JsonNode firstPage = board(alpha, "ALL_TIME", "ACTIVITY", 0, 1);
		JsonNode secondPage = board(alpha, "ALL_TIME", "ACTIVITY", 1, 1);
		assertEquals(1, firstPage.get("content").get(0).get("rank").asInt());
		assertEquals(2, secondPage.get("content").get(0).get("rank").asInt());
		assertEquals(firstPage.get("content").get(0).get("userId").asLong(),
				board(alpha, "ALL_TIME", "ACTIVITY", 0, 1).get("content").get(0).get("userId").asLong());

		mockMvc.perform(get("/api/leaderboard")
				.param("period", "YEARLY")
				.header(HttpHeaders.AUTHORIZATION, bearer(alpha)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void achievementsAreAwardedOnceAndReflectBackendProgress() throws Exception {
		String email = "phase6-achievements@example.com";
		String token = register(email, "Achiever");
		User user = users.findByEmailIgnoreCase(email).orElseThrow();

		JsonNode initial = overview(token);
		JsonNode firstTask = achievement(initial, "FIRST_TASK");
		assertFalse(firstTask.get("earned").asBoolean());
		assertEquals(1, firstTask.get("target").asInt());
		assertEquals(30, achievement(initial, "STREAK_30").get("target").asInt());
		assertEquals(100, achievement(initial, "DSA_100").get("target").asInt());
		assertEquals(500, achievement(initial, "XP_500").get("target").asInt());
		assertEquals(1, achievement(initial, "MOCK_FIRST").get("target").asInt());
		assertEquals(10, achievement(initial, "MOCK_10").get("target").asInt());

		JsonNode plan = generatePlan(token, 1);
		long taskId = plan.get("tasks").get(0).get("id").asLong();
		completeTask(token, taskId);

		JsonNode afterTask = overview(token);
		JsonNode earnedFirstTask = achievement(afterTask, "FIRST_TASK");
		assertTrue(earnedFirstTask.get("earned").asBoolean());
		assertNotNull(earnedFirstTask.get("earnedAt").asText());
		assertGreaterThanOrEqual(1, earnedFirstTask.get("progress").asLong());
		long earnedCountAfterTask = afterTask.get("earnedCount").asLong();
		long firstTaskDefinitionId = earnedFirstTask.get("id").asLong();

		// Re-completing the same task must not create a second award.
		completeTask(token, taskId);
		JsonNode afterDuplicate = overview(token);
		assertEquals(earnedCountAfterTask, afterDuplicate.get("earnedCount").asLong());
		assertEquals(1, userAchievements.countByIdUserIdAndIdAchievementId(user.getId(), firstTaskDefinitionId));
		assertEquals(1, notifications.countByUserIdAndDedupeKey(user.getId(), "ACHIEVEMENT:FIRST_TASK"));

		long templateId = createTemplate(token, "Achievement mock", "DATA_STRUCTURES_AND_ALGORITHMS", "EASY", 5);
		long sessionId = startSession(token, templateId);
		mockMvc.perform(post("/api/mock-interviews/sessions/{id}/complete", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("COMPLETED"));

		JsonNode afterMock = overview(token);
		assertTrue(achievement(afterMock, "MOCK_FIRST").get("earned").asBoolean());
		long earnedCountAfterMock = afterMock.get("earnedCount").asLong();
		long mockDefinitionId = achievement(afterMock, "MOCK_FIRST").get("id").asLong();

		mockMvc.perform(post("/api/mock-interviews/sessions/{id}/complete", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk());

		JsonNode afterMockDuplicate = overview(token);
		assertEquals(earnedCountAfterMock, afterMockDuplicate.get("earnedCount").asLong());
		assertEquals(1, userAchievements.countByIdUserIdAndIdAchievementId(user.getId(), mockDefinitionId));

		UserProgress userProgress = progress.findByUserId(user.getId()).orElseThrow();
		userProgress.award(600, 2);
		progress.saveAndFlush(userProgress);
		entityManager.clear();

		JsonNode afterXp = overview(token);
		assertTrue(achievement(afterXp, "XP_500").get("earned").asBoolean());
		assertFalse(achievement(afterXp, "XP_1000").get("earned").asBoolean());
		assertGreaterThanOrEqual(500, achievement(afterXp, "XP_500").get("progress").asLong());
		assertEquals(1, notifications.countByUserIdAndDedupeKey(user.getId(), "ACHIEVEMENT:XP_500"));

		jdbcTemplate.update(
				"update user_streaks set current_streak = 30, longest_streak = 30, total_active_days = 30 "
						+ "where user_id = ?",
				user.getId());
		entityManager.clear();

		JsonNode afterStreak = overview(token);
		assertTrue(achievement(afterStreak, "STREAK_7").get("earned").asBoolean());
		assertTrue(achievement(afterStreak, "STREAK_30").get("earned").asBoolean());
		assertTrue(achievement(afterStreak, "CONSISTENT_LEARNER").get("earned").asBoolean());
		assertFalse(achievement(afterStreak, "DSA_100").get("earned").asBoolean());
		long earnedCountAfterStreak = afterStreak.get("earnedCount").asLong();
		assertEquals(1, notifications.countByUserIdAndDedupeKey(user.getId(), "ACHIEVEMENT:STREAK_30"));

		JsonNode repeated = overview(token);
		assertEquals(earnedCountAfterStreak, repeated.get("earnedCount").asLong());
		assertEquals(1, notifications.countByUserIdAndDedupeKey(user.getId(), "ACHIEVEMENT:STREAK_30"));
	}

	@Test
	void notificationsAreIsolatedDedupedPagedAndSettingAware() throws Exception {
		String email = "phase6-notifications@example.com";
		String token = register(email, "Notified");
		String other = register("phase6-notifications-other@example.com", "Other");
		User user = users.findByEmailIgnoreCase(email).orElseThrow();

		mockMvc.perform(get("/api/notifications").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(0));

		JsonNode plan = generatePlan(token, 2);
		long firstTaskId = plan.get("tasks").get(0).get("id").asLong();
		long secondTaskId = plan.get("tasks").get(1).get("id").asLong();
		completeTask(token, firstTaskId);

		JsonNode firstPage = notificationPage(token, 0, 20);
		assertTrue(firstPage.get("totalElements").asLong() >= 2);
		JsonNode taskNotification = notification(firstPage, "TASK_COMPLETED");
		assertNotNull(taskNotification);
		assertNotNull(notification(firstPage, "ACHIEVEMENT_UNLOCKED"));
		long notificationId = taskNotification.get("id").asLong();

		long unread = unreadCount(token);
		assertEquals(firstPage.get("totalElements").asLong(), unread);

		mockMvc.perform(get("/api/notifications").header(HttpHeaders.AUTHORIZATION, bearer(other)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(0));

		mockMvc.perform(post("/api/notifications/{id}/read", notificationId)
				.header(HttpHeaders.AUTHORIZATION, bearer(other)))
				.andExpect(status().isNotFound());

		mockMvc.perform(post("/api/notifications/{id}/read", notificationId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.read").value(true));
		assertEquals(unread - 1, unreadCount(token));

		// The second task is unlocked after the first completion.
		completeTask(token, secondTaskId);
		JsonNode paged = notificationPage(token, 0, 1);
		assertEquals(1, paged.get("content").size());
		assertTrue(paged.get("totalElements").asLong() >= 3);
		assertEquals(0, paged.get("page").asInt());
		JsonNode secondPage = notificationPage(token, 1, 1);
		assertEquals(1, secondPage.get("content").size());
		assertTrue(secondPage.get("content").get(0).get("id").asLong()
				!= paged.get("content").get(0).get("id").asLong());

		completeTask(token, firstTaskId);
		assertEquals(1, notifications.countByUserIdAndDedupeKey(user.getId(), "TASK:" + firstTaskId));

		mockMvc.perform(post("/api/notifications/read-all").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.count").value(0));
		assertEquals(0, unreadCount(token));

		// Disabled notification preferences suppress creation entirely.
		String mutedEmail = "phase6-notifications-muted@example.com";
		String muted = register(mutedEmail, "Muted");
		User mutedUser = users.findByEmailIgnoreCase(mutedEmail).orElseThrow();
		updateSettings(muted, Map.of(
				"notificationInAppEnabled", true,
				"notificationTasks", false,
				"notificationAchievements", false,
				"notificationStreaks", false,
				"notificationCommunity", false,
				"notificationMockInterviews", false,
				"notificationReminders", false), null);
		JsonNode mutedPlan = generatePlan(muted, 1);
		completeTask(muted, mutedPlan.get("tasks").get(0).get("id").asLong());

		mockMvc.perform(get("/api/notifications").header(HttpHeaders.AUTHORIZATION, bearer(muted)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(0));
		assertEquals(0, notifications.countByUserIdAndDedupeKey(mutedUser.getId(), "ACHIEVEMENT:FIRST_TASK"));

		// A reminder is generated lazily once per day, never duplicated.
		String reminderEmail = "phase6-notifications-reminder@example.com";
		String reminder = register(reminderEmail, "Reminder");
		updateSettings(reminder, Map.of(), "00:00");

		JsonNode reminders = notificationPage(reminder, 0, 20);
		assertEquals(1, reminders.get("totalElements").asLong());
		assertEquals("REMINDER", reminders.get("content").get(0).get("type").asText());
		assertEquals("/daily-plan", reminders.get("content").get(0).get("link").asText());

		JsonNode repeated = notificationPage(reminder, 0, 20);
		assertEquals(1, repeated.get("totalElements").asLong());
	}

	private JsonNode board(String token, String period, String metric, int page, int size) throws Exception {
		MvcResult result = mockMvc.perform(get("/api/leaderboard")
				.param("period", period)
				.param("metric", metric)
				.param("page", Integer.toString(page))
				.param("size", Integer.toString(size))
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString());
	}

	private static JsonNode entry(JsonNode board, String username) {
		for (JsonNode entry : board.get("content")) {
			if (username.equals(entry.get("username").asText())) {
				return entry;
			}
		}
		throw new AssertionError("No leaderboard entry for " + username);
	}

	private JsonNode overview(String token) throws Exception {
		MvcResult result = mockMvc.perform(get("/api/achievements")
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString());
	}

	private static JsonNode achievement(JsonNode overview, String code) {
		for (JsonNode achievement : overview.get("achievements")) {
			if (code.equals(achievement.get("code").asText())) {
				return achievement;
			}
		}
		throw new AssertionError("No achievement definition for " + code);
	}

	private JsonNode notificationPage(String token, int page, int size) throws Exception {
		MvcResult result = mockMvc.perform(get("/api/notifications")
				.param("page", Integer.toString(page))
				.param("size", Integer.toString(size))
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString());
	}

	private static JsonNode notification(JsonNode page, String type) {
		for (JsonNode notification : page.get("content")) {
			if (type.equals(notification.get("type").asText())) {
				return notification;
			}
		}
		return null;
	}

	private long unreadCount(String token) throws Exception {
		MvcResult result = mockMvc.perform(get("/api/notifications/unread-count")
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString()).get("count").asLong();
	}

	private JsonNode generatePlan(String token, int taskCount) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/plans/daily")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("taskCount", taskCount, "categoryIds", java.util.List.of()))))
				.andExpect(status().isCreated())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString());
	}

	private JsonNode getPlan(String token) throws Exception {
		MvcResult result = mockMvc.perform(get("/api/plans/daily")
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString());
	}

	private long completeTask(String token, long taskId) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/plans/tasks/{id}/complete", taskId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString()).get("xpAwarded").asLong();
	}

	private long createTemplate(String token, String title, String category, String difficulty, int duration)
			throws Exception {
		MvcResult result = mockMvc.perform(post("/api/mock-interviews/templates")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("title", title, "category", category, "difficulty", difficulty,
						"durationMinutes", duration))))
				.andExpect(status().isCreated())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
	}

	private long startSession(String token, long templateId) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/mock-interviews/sessions")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("templateId", templateId, "focusMonitoringConsent", false))))
				.andExpect(status().isCreated())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
	}

	private void updateSettings(String token, Map<String, Object> notificationOverrides, String reminderTime)
			throws Exception {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("theme", "SYSTEM");
		body.put("emailNotifications", true);
		body.put("dailyGoalMinutes", 60);
		body.put("reminderTime", reminderTime);
		body.put("timezone", "UTC");
		body.putAll(notificationOverrides);
		mockMvc.perform(put("/api/users/me/settings")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(body)))
				.andExpect(status().isOk());
	}

	private String json(Object value) throws Exception {
		return objectMapper.writeValueAsString(value);
	}

	private String register(String email, String displayName) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("displayName", displayName, "email", email, "password", "StrongPass1"))))
				.andExpect(status().isCreated())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
	}

	private static String bearer(String token) {
		return "Bearer " + token;
	}

	private static void assertGreaterThanOrEqual(long minimum, long actual) {
		if (actual < minimum) {
			throw new AssertionError("Expected " + actual + " to be >= " + minimum);
		}
	}
}

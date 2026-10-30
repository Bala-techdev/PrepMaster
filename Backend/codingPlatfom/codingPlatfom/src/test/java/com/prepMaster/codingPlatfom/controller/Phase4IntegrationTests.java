package com.prepMaster.codingPlatfom.controller;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class Phase4IntegrationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void profileAndSettingsEndpointsRoundTrip() throws Exception {
		String token = register("phase4-profile@example.com", "Phase Four");

		mockMvc.perform(put("/api/users/me/profile")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"displayName":"Phase Four","headline":"Backend learner","bio":"Building PrepMaster",
						 "avatarUrl":"https://example.com/avatar.png","location":"Dubai","targetRole":"Java Developer",
						 "experienceLevel":"MID","githubUrl":"https://github.com/example",
						 "linkedinUrl":"https://linkedin.com/in/example"}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.displayName").value("Phase Four"))
				.andExpect(jsonPath("$.experienceLevel").value("MID"));

		mockMvc.perform(put("/api/users/me/settings")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"theme":"DARK","emailNotifications":false,"dailyGoalMinutes":90,
						 "reminderTime":"07:30","timezone":"Asia/Dubai"}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.theme").value("DARK"))
				.andExpect(jsonPath("$.emailNotifications").value(false))
				.andExpect(jsonPath("$.dailyGoalMinutes").value(90))
				.andExpect(jsonPath("$.reminderTime").value("07:30:00"))
				.andExpect(jsonPath("$.timezone").value("Asia/Dubai"));

		mockMvc.perform(get("/api/users/me").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("phase4-profile@example.com"))
				.andExpect(jsonPath("$.profile.headline").value("Backend learner"))
				.andExpect(jsonPath("$.settings.theme").value("DARK"))
				.andExpect(jsonPath("$.password").doesNotExist());
	}

	@Test
	void learningCatalogSupportsSearchDetailAndTopics() throws Exception {
		String token = register("phase4-learning@example.com", "Phase Four");

		mockMvc.perform(get("/api/learning/categories").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(greaterThan(0))));

		mockMvc.perform(get("/api/learning/topics").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(greaterThan(0))));

		MvcResult search = mockMvc.perform(get("/api/learning/questions")
				.param("search", "Two Sum")
				.param("difficulty", "EASY")
				.param("page", "0")
				.param("size", "5")
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].title").value("Two Sum"))
				.andExpect(jsonPath("$.content[0].difficulty").value("EASY"))
				.andReturn();

		long questionId = objectMapper.readTree(search.getResponse().getContentAsString())
				.get("content").get(0).get("id").asLong();

		mockMvc.perform(get("/api/learning/questions/{id}", questionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("Two Sum"))
				.andExpect(jsonPath("$.description", notNullValue()));
	}

	@Test
	void dailyPlanCompletionUpdatesProgressAndSolvedQuestions() throws Exception {
		String token = register("phase4-plan@example.com", "Phase Four");

		MvcResult generated = mockMvc.perform(post("/api/plans/daily")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"taskCount":3,"categoryIds":[]}
						"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.planDate", notNullValue()))
				.andExpect(jsonPath("$.tasks", hasSize(3)))
				.andExpect(jsonPath("$.tasks[0].status").value("AVAILABLE"))
				.andExpect(jsonPath("$.tasks[1].status").value("LOCKED"))
				.andExpect(jsonPath("$.tasks[0].questionId", notNullValue()))
				.andReturn();

		var plan = objectMapper.readTree(generated.getResponse().getContentAsString());
		long firstTaskId = plan.get("tasks").get(0).get("id").asLong();
		long firstQuestionId = plan.get("tasks").get(0).get("questionId").asLong();

		mockMvc.perform(get("/api/plans/daily").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.tasks", hasSize(3)));

		mockMvc.perform(post("/api/plans/tasks/{taskId}/complete", firstTaskId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.taskId").value(firstTaskId))
				.andExpect(jsonPath("$.xpAwarded", greaterThan(0)));

		// Completing the same task again must not award XP twice.
		mockMvc.perform(post("/api/plans/tasks/{taskId}/complete", firstTaskId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.taskId").value(firstTaskId));

		mockMvc.perform(get("/api/progress").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.completedTasks").value(1))
				.andExpect(jsonPath("$.totalXp", greaterThan(0)))
				.andExpect(jsonPath("$.currentStreak").value(1))
				.andExpect(jsonPath("$.longestStreak").value(1));

		mockMvc.perform(get("/api/progress/questions").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].questionId").value(firstQuestionId))
				.andExpect(jsonPath("$[0].difficulty", notNullValue()));

		mockMvc.perform(get("/api/progress/categories").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(greaterThan(0))))
				.andExpect(jsonPath("$[0].totalQuestions", greaterThan(0)));
	}

	@Test
	void corsAllowsTheConfiguredFrontendOriginOnly() throws Exception {
		mockMvc.perform(options("/api/users/me")
				.header(HttpHeaders.ORIGIN, "http://localhost:5180")
				.header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
				.header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Authorization"))
				.andExpect(status().isOk())
				.andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5180"));

		mockMvc.perform(options("/api/users/me")
				.header(HttpHeaders.ORIGIN, "http://evil.example.com")
				.header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
				.andExpect(status().isForbidden());
	}

	private String register(String email, String displayName) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"displayName":"%s","email":"%s","password":"StrongPass1"}
						""".formatted(displayName, email)))
				.andExpect(status().isCreated())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
	}

	private static String bearer(String token) {
		return "Bearer " + token;
	}
}

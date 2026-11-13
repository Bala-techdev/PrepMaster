package com.prepMaster.codingPlatfom.controller;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Timestamp;
import java.time.Instant;

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

import jakarta.persistence.EntityManager;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class Phase5IntegrationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private EntityManager entityManager;

	@Test
	void sessionLifecycleIsServerOwnedAndOwnerScoped() throws Exception {
		String owner = register("phase5-owner@example.com", "Phase Five Owner");
		String other = register("phase5-other@example.com", "Phase Five Other");

		mockMvc.perform(get("/api/mock-interviews/categories").header(HttpHeaders.AUTHORIZATION, bearer(owner)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(5)))
				.andExpect(jsonPath("$[0].code", notNullValue()))
				.andExpect(jsonPath("$[0].label", notNullValue()));

		mockMvc.perform(get("/api/mock-interviews/difficulties").header(HttpHeaders.AUTHORIZATION, bearer(owner)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(3)));

		long templateId = createTemplate(owner, "DSA warm-up", "DATA_STRUCTURES_AND_ALGORITHMS", "EASY", 30);

		MvcResult started = mockMvc.perform(post("/api/mock-interviews/sessions")
				.header(HttpHeaders.AUTHORIZATION, bearer(owner))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"templateId":%d,"focusMonitoringConsent":true}
						""".formatted(templateId)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("IN_PROGRESS"))
				.andExpect(jsonPath("$.questionCount").value(5))
				.andExpect(jsonPath("$.questions", hasSize(5)))
				.andExpect(jsonPath("$.remainingSeconds", greaterThan(0)))
				.andExpect(jsonPath("$.serverTime", notNullValue()))
				.andExpect(jsonPath("$.focusMonitoringConsented").value(true))
				.andReturn();

		var session = objectMapper.readTree(started.getResponse().getContentAsString());
		long sessionId = session.get("id").asLong();
		long questionId = session.get("questions").get(0).get("id").asLong();

		mockMvc.perform(get("/api/mock-interviews/sessions/active").header(HttpHeaders.AUTHORIZATION, bearer(owner)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(sessionId));

		mockMvc.perform(get("/api/mock-interviews/sessions/{id}", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(other)))
				.andExpect(status().isNotFound());

		// Another user can neither start from the owner's template nor answer its questions.
		mockMvc.perform(post("/api/mock-interviews/sessions")
				.header(HttpHeaders.AUTHORIZATION, bearer(other))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"templateId":%d,"focusMonitoringConsent":false}
						""".formatted(templateId)))
				.andExpect(status().isNotFound());

		mockMvc.perform(put("/api/mock-interviews/sessions/{sessionId}/questions/{questionId}/answer",
				sessionId, questionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(other))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"answerText":"not my session","answered":true}
						"""))
				.andExpect(status().isNotFound());

		mockMvc.perform(put("/api/mock-interviews/sessions/{sessionId}/questions/{questionId}/answer",
				sessionId, questionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(owner))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"answerText":"Use a hash map for O(1) lookups.","codeText":"class Solution {}",
						 "language":"java","answered":true}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.answer.answered").value(true))
				.andExpect(jsonPath("$.answer.codeText").value("class Solution {}"));

		mockMvc.perform(post("/api/mock-interviews/sessions/{id}/focus-events", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(owner))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"eventType":"BLUR"}
						"""))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/mock-interviews/sessions/{id}", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(owner)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.focusLossCount").value(1));

		// Revoking consent stops further focus tracking without deleting past events.
		mockMvc.perform(post("/api/mock-interviews/sessions/{id}/focus-consent", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(owner))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"consented":false}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.focusMonitoringConsented").value(false));

		mockMvc.perform(post("/api/mock-interviews/sessions/{id}/focus-events", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(owner))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"eventType":"VISIBILITY_HIDDEN"}
						"""))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/mock-interviews/sessions/{id}", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(owner)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.focusLossCount").value(1));

		MvcResult completed = mockMvc.perform(post("/api/mock-interviews/sessions/{id}/complete", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(owner)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("COMPLETED"))
				.andExpect(jsonPath("$.questionsAnswered").value(1))
				.andExpect(jsonPath("$.completionPercentage").value(20.0))
				.andExpect(jsonPath("$.measuredTimeSeconds", greaterThanOrEqualTo(0)))
				.andExpect(jsonPath("$.estimatedTimeSeconds", greaterThan(0)))
				.andExpect(jsonPath("$.focusLossCount").value(1))
				.andReturn();

		long resultId = objectMapper.readTree(completed.getResponse().getContentAsString()).get("id").asLong();

		// Completing twice returns the same result and does not create another row.
		mockMvc.perform(post("/api/mock-interviews/sessions/{id}/complete", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(owner)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(resultId));

		mockMvc.perform(get("/api/mock-interviews/sessions/{id}/result", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(owner)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(resultId))
				.andExpect(jsonPath("$.questions", hasSize(5)));

		mockMvc.perform(get("/api/mock-interviews/history")
				.param("page", "0")
				.param("size", "1")
				.header(HttpHeaders.AUTHORIZATION, bearer(owner)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.content[0].status").value("COMPLETED"))
				.andExpect(jsonPath("$.content[0].score").value(20.0));

		mockMvc.perform(get("/api/mock-interviews/performance").header(HttpHeaders.AUTHORIZATION, bearer(owner)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalSessions").value(1))
				.andExpect(jsonPath("$.completedSessions").value(1))
				.andExpect(jsonPath("$.averageCompletionPercentage").value(20.0));

		mockMvc.perform(post("/api/mock-interviews/sessions/{id}/cancel", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(owner)))
				.andExpect(status().isConflict());

		// History is per-user, so the other account sees nothing.
		mockMvc.perform(get("/api/mock-interviews/history").header(HttpHeaders.AUTHORIZATION, bearer(other)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(0));
	}

	@Test
	void activeSessionPreventsStartingAnotherAndCanBeCancelled() throws Exception {
		String token = register("phase5-active@example.com", "Phase Five Active");
		long templateId = createTemplate(token, "Java review", "JAVA_AND_OOP", "MEDIUM", 45);

		MvcResult started = mockMvc.perform(post("/api/mock-interviews/sessions")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"templateId":%d,"focusMonitoringConsent":false}
						""".formatted(templateId)))
				.andExpect(status().isCreated())
				.andReturn();
		long sessionId = objectMapper.readTree(started.getResponse().getContentAsString()).get("id").asLong();

		mockMvc.perform(post("/api/mock-interviews/sessions")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"templateId":%d,"focusMonitoringConsent":false}
						""".formatted(templateId)))
				.andExpect(status().isConflict());

		mockMvc.perform(post("/api/mock-interviews/sessions/{id}/cancel", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("CANCELLED"));

		mockMvc.perform(get("/api/mock-interviews/sessions/active").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/mock-interviews/sessions/{id}/result", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isConflict());
	}

	@Test
	void expiredSessionIsFinalizedAndRejectsAnswers() throws Exception {
		String token = register("phase5-expiry@example.com", "Phase Five Expiry");
		long templateId = createTemplate(token, "Expiry drill", "TECHNICAL_FUNDAMENTALS", "HARD", 5);

		MvcResult started = mockMvc.perform(post("/api/mock-interviews/sessions")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"templateId":%d,"focusMonitoringConsent":false}
						""".formatted(templateId)))
				.andExpect(status().isCreated())
				.andReturn();
		var session = objectMapper.readTree(started.getResponse().getContentAsString());
		long sessionId = session.get("id").asLong();
		long questionId = session.get("questions").get(0).get("id").asLong();

		forceExpired(sessionId);

		mockMvc.perform(get("/api/mock-interviews/sessions/{id}", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("EXPIRED"))
				.andExpect(jsonPath("$.remainingSeconds").value(0));

		mockMvc.perform(get("/api/mock-interviews/sessions/active").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isNoContent());

		mockMvc.perform(put("/api/mock-interviews/sessions/{sessionId}/questions/{questionId}/answer",
				sessionId, questionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"answerText":"too late","answered":true}
						"""))
				.andExpect(status().isConflict());

		mockMvc.perform(get("/api/mock-interviews/sessions/{id}/result", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("EXPIRED"))
				.andExpect(jsonPath("$.questionsAnswered").value(0));

		mockMvc.perform(post("/api/mock-interviews/sessions/{id}/complete", sessionId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("EXPIRED"));
	}

	@Test
	void templateValidationRejectsInvalidInput() throws Exception {
		String token = register("phase5-validation@example.com", "Phase Five Validation");

		mockMvc.perform(post("/api/mock-interviews/templates")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"title":" ","category":"DATA_STRUCTURES_AND_ALGORITHMS","difficulty":"EASY",
						 "durationMinutes":0}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.errors.title", notNullValue()))
				.andExpect(jsonPath("$.errors.durationMinutes", notNullValue()));

		mockMvc.perform(post("/api/mock-interviews/templates")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"title":"Valid title","category":"NOT_A_CATEGORY","difficulty":"EASY",
						 "durationMinutes":30}
						"""))
				.andExpect(status().isBadRequest());

		mockMvc.perform(post("/api/mock-interviews/templates")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"title":"Default duration","category":"SYSTEM_DESIGN","difficulty":"MEDIUM"}
						"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.durationMinutes").value(45));
	}

	private long createTemplate(String token, String title, String category, String difficulty, int duration)
			throws Exception {
		MvcResult result = mockMvc.perform(post("/api/mock-interviews/templates")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"title":"%s","description":"Integration test template","category":"%s",
						 "difficulty":"%s","durationMinutes":%d}
						""".formatted(title, category, difficulty, duration)))
				.andExpect(status().isCreated())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
	}

	private void forceExpired(long sessionId) {
		jdbcTemplate.update("update interview_sessions set expires_at = ? where id = ?",
				Timestamp.from(Instant.now().minusSeconds(60)), sessionId);
		entityManager.clear();
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

package com.prepMaster.codingPlatfom.controller;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class Phase6CommunityIntegrationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void communityCrudOwnershipLikesCommentsSearchAndActivity() throws Exception {
		String alice = register("phase6-community-alice@example.com", "Alice");
		String bob = register("phase6-community-bob@example.com", "Bob");

		mockMvc.perform(get("/api/community/topics").header(HttpHeaders.AUTHORIZATION, bearer(alice)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasItem("DSA")))
				.andExpect(jsonPath("$", hasItem("Java OOP")))
				.andExpect(jsonPath("$", hasItem("General")));

		long postId = createPost(alice, "Two sum hash map approach",
				"I used a hash map to store the complement while scanning the array.", "DSA");

		mockMvc.perform(get("/api/community/posts/{id}", postId).header(HttpHeaders.AUTHORIZATION, bearer(bob)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.author.username").value("phase6-community-alice"))
				.andExpect(jsonPath("$.author.displayName").value("Alice"))
				.andExpect(jsonPath("$.author.email").doesNotExist())
				.andExpect(jsonPath("$.ownedByMe").value(false))
				.andExpect(jsonPath("$.likedByMe").value(false))
				.andExpect(jsonPath("$.likeCount").value(0));

		mockMvc.perform(put("/api/community/posts/{id}", postId)
				.header(HttpHeaders.AUTHORIZATION, bearer(bob))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("title", "Hijacked title", "body", "This should never be saved.",
						"topic", "General"))))
				.andExpect(status().isNotFound());

		mockMvc.perform(delete("/api/community/posts/{id}", postId)
				.header(HttpHeaders.AUTHORIZATION, bearer(bob)))
				.andExpect(status().isNotFound());

		mockMvc.perform(post("/api/community/posts/{id}/like", postId)
				.header(HttpHeaders.AUTHORIZATION, bearer(bob)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.likeCount").value(1))
				.andExpect(jsonPath("$.liked").value(true));

		mockMvc.perform(get("/api/community/posts/{id}", postId).header(HttpHeaders.AUTHORIZATION, bearer(bob)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.likedByMe").value(true))
				.andExpect(jsonPath("$.likeCount").value(1));

		mockMvc.perform(get("/api/community/posts")
				.param("search", "complement")
				.param("topic", "DSA")
				.param("page", "0")
				.param("size", "5")
				.header(HttpHeaders.AUTHORIZATION, bearer(alice)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements", greaterThan(0)))
				.andExpect(jsonPath("$.content[0].id").value(postId));

		long bobCommentId = addComment(bob, postId, "This is how I solved it too.");
		long aliceCommentId = addComment(alice, postId, "Thanks for sharing your solution.");

		mockMvc.perform(put("/api/community/comments/{id}", aliceCommentId)
				.header(HttpHeaders.AUTHORIZATION, bearer(bob))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("body", "Hijacked comment"))))
				.andExpect(status().isNotFound());

		mockMvc.perform(delete("/api/community/comments/{id}", aliceCommentId)
				.header(HttpHeaders.AUTHORIZATION, bearer(bob)))
				.andExpect(status().isNotFound());

		mockMvc.perform(put("/api/community/posts/{id}", postId)
				.header(HttpHeaders.AUTHORIZATION, bearer(alice))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("title", "Updated two sum approach",
						"body", "Use a hash map and store each value before moving on.", "topic", "DSA"))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.ownedByMe").value(true))
				.andExpect(jsonPath("$.title").value("Updated two sum approach"));

		mockMvc.perform(get("/api/community/posts")
				.param("search", "Updated two sum")
				.header(HttpHeaders.AUTHORIZATION, bearer(alice)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].id").value(postId));

		mockMvc.perform(get("/api/community/posts/{id}/comments", postId)
				.param("page", "0")
				.param("size", "1")
				.header(HttpHeaders.AUTHORIZATION, bearer(alice)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(2))
				.andExpect(jsonPath("$.content", hasSize(1)));

		mockMvc.perform(get("/api/community/activity").header(HttpHeaders.AUTHORIZATION, bearer(alice)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(greaterThan(0))))
				.andExpect(jsonPath("$[0].at", notNullValue()));

		// The post owner receives community notifications; other users receive none.
		mockMvc.perform(get("/api/notifications").header(HttpHeaders.AUTHORIZATION, bearer(alice)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements", greaterThan(0)))
				.andExpect(jsonPath("$.content[0].type").value("COMMUNITY_ACTIVITY"));

		mockMvc.perform(get("/api/notifications").header(HttpHeaders.AUTHORIZATION, bearer(bob)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(0));

		mockMvc.perform(delete("/api/community/comments/{id}", aliceCommentId)
				.header(HttpHeaders.AUTHORIZATION, bearer(alice)))
				.andExpect(status().isNoContent());

		mockMvc.perform(delete("/api/community/comments/{id}", bobCommentId)
				.header(HttpHeaders.AUTHORIZATION, bearer(bob)))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/community/posts/{id}/comments", postId)
				.header(HttpHeaders.AUTHORIZATION, bearer(alice)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(0));

		mockMvc.perform(delete("/api/community/posts/{id}", postId)
				.header(HttpHeaders.AUTHORIZATION, bearer(alice)))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/community/posts/{id}", postId).header(HttpHeaders.AUTHORIZATION, bearer(alice)))
				.andExpect(status().isNotFound());
	}

	@Test
	void communityValidationSanitizesPlainTextAndRejectsUnknownTopics() throws Exception {
		String token = register("phase6-community-validation@example.com", "Validation");

		mockMvc.perform(post("/api/community/posts")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("title", "Too short", "body", "short", "topic", "DSA"))))
				.andExpect(status().isBadRequest());

		mockMvc.perform(post("/api/community/posts")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("title", "Unknown topic post", "body", "A valid body for this post.",
						"topic", "Crypto"))))
				.andExpect(status().isConflict());

		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("title", "  Script tag stays text  ");
		payload.put("body", "<script>alert('x')</script>\u0000 safe text");
		payload.put("topic", "general");
		MvcResult created = mockMvc.perform(post("/api/community/posts")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(payload)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title").value("Script tag stays text"))
				.andExpect(jsonPath("$.body").value("<script>alert('x')</script> safe text"))
				.andExpect(jsonPath("$.topic").value("General"))
				.andReturn();

		long postId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

		mockMvc.perform(post("/api/community/posts/{id}/comments", postId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("body", "\u0000\u0001"))))
				.andExpect(status().isConflict());
	}

	@Test
	void postRateLimitBlocksTheSixthPostInTenMinutes() throws Exception {
		String token = register("phase6-community-post-limit@example.com", "Post Limit");

		for (int index = 0; index < 5; index++) {
			mockMvc.perform(post("/api/community/posts")
					.header(HttpHeaders.AUTHORIZATION, bearer(token))
					.contentType(MediaType.APPLICATION_JSON)
					.content(json(Map.of("title", "Rate limit post " + index,
							"body", "A valid body for rate limit post " + index + ".", "topic", "General"))))
					.andExpect(status().isCreated());
		}

		mockMvc.perform(post("/api/community/posts")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("title", "Rate limit post blocked",
						"body", "This request must be rejected by the limiter.", "topic", "General"))))
				.andExpect(status().isTooManyRequests());
	}

	@Test
	void commentRateLimitBlocksTheTwentyFirstCommentInTenMinutes() throws Exception {
		String token = register("phase6-community-comment-limit@example.com", "Comment Limit");
		long postId = createPost(token, "Comment rate limit thread",
				"This thread exists to exercise the comment limiter.", "General");

		for (int index = 0; index < 20; index++) {
			mockMvc.perform(post("/api/community/posts/{id}/comments", postId)
					.header(HttpHeaders.AUTHORIZATION, bearer(token))
					.contentType(MediaType.APPLICATION_JSON)
					.content(json(Map.of("body", "Rate limit comment " + index))))
					.andExpect(status().isCreated());
		}

		mockMvc.perform(post("/api/community/posts/{id}/comments", postId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("body", "This comment must be rejected."))))
				.andExpect(status().isTooManyRequests());
	}

	private long createPost(String token, String title, String body, String topic) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/community/posts")
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("title", title, "body", body, "topic", topic))))
				.andExpect(status().isCreated())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
	}

	private long addComment(String token, long postId, String body) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/community/posts/{id}/comments", postId)
				.header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("body", body))))
				.andExpect(status().isCreated())
				.andReturn();
		return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
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
}

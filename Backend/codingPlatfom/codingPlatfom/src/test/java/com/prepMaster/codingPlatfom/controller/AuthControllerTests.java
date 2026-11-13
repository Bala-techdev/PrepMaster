package com.prepMaster.codingPlatfom.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JwtEncoder jwtEncoder;

	@Test
	void registersAndLogsInWithoutExposingPassword() throws Exception {
		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"displayName":"Alice","email":" Alice@Example.COM ","password":"StrongPass1"}
						"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.accessToken").isNotEmpty())
				.andExpect(jsonPath("$.user.email").value("alice@example.com"))
				.andExpect(jsonPath("$.user.displayName").value("Alice"))
				.andExpect(jsonPath("$.user.password").doesNotExist());

		mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"email":"ALICE@example.com","password":"StrongPass1"}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.tokenType").value("Bearer"))
				.andExpect(jsonPath("$.expiresIn").value(900));
	}

	@Test
	void rejectsDuplicateEmailAndInvalidCredentialsGenerically() throws Exception {
		register("duplicate@example.com");

		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"displayName":"Other","email":"DUPLICATE@example.com","password":"StrongPass1"}
						"""))
				.andExpect(status().isConflict());

		mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"email":"duplicate@example.com","password":"WrongPass1"}
						"""))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.detail").value("Invalid email or password"));

		mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"email":"missing@example.com","password":"WrongPass1"}
						"""))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.detail").value("Invalid email or password"));
	}

	@Test
	void protectsPrivateEndpointsAndRejectsMalformedTokens() throws Exception {
		mockMvc.perform(get("/api/users/me")).andExpect(status().isUnauthorized());
		mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer not-a-jwt"))
				.andExpect(status().isUnauthorized());

		String expiredToken = jwtEncoder.encode(JwtEncoderParameters.from(
				JwsHeader.with(MacAlgorithm.HS256).build(),
				JwtClaimsSet.builder().subject("1").issuedAt(java.time.Instant.now().minusSeconds(7200))
						.expiresAt(java.time.Instant.now().minusSeconds(3600)).build()))
				.getTokenValue();
		mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer " + expiredToken))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void validatesRegistrationInput() throws Exception {
		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"displayName":"","email":"not-an-email","password":"weak"}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.errors.email").exists())
				.andExpect(jsonPath("$.errors.password").exists());
	}

	@Test
	void rotatesRefreshTokenAndRevokesItOnLogout() throws Exception {
		register("refresh@example.com");
		MvcResult login = mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"email":"refresh@example.com","password":"StrongPass1"}
						"""))
				.andExpect(status().isOk())
				.andReturn();
		String refreshToken = tokenFrom(login.getResponse().getContentAsString());

		MvcResult refreshed = mockMvc.perform(post("/api/auth/refresh")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""" 
						{"refreshToken":"%s"}
						""".formatted(refreshToken)))
				.andExpect(status().isOk())
				.andReturn();
		String rotated = tokenFrom(refreshed.getResponse().getContentAsString());

		mockMvc.perform(post("/api/auth/refresh")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""" 
						{"refreshToken":"%s"}
						""".formatted(refreshToken)))
				.andExpect(status().isUnauthorized());

		mockMvc.perform(post("/api/auth/logout")
				.contentType(MediaType.APPLICATION_JSON)
				.content(""" 
						{"refreshToken":"%s"}
						""".formatted(rotated)))
				.andExpect(status().isOk());
	}

	private void register(String email) throws Exception {
		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"displayName":"Test User","email":"%s","password":"StrongPass1"}
						""".formatted(email)))
				.andExpect(status().isCreated());
	}

	private String tokenFrom(String response) {
		Matcher matcher = Pattern.compile("\"refreshToken\":\"([^\"]+)\"").matcher(response);
		if (!matcher.find()) {
			throw new AssertionError("refreshToken missing from authentication response");
		}
		return matcher.group(1);
	}
}

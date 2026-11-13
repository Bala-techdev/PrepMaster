package com.prepMaster.codingPlatfom.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
@ConditionalOnProperty(name = "app.auth.google-enabled", havingValue = "true")
public class GoogleOAuthConfig {

	@Bean
	GoogleOAuthSuccessHandler googleOAuthSuccessHandler(com.prepMaster.codingPlatfom.service.AuthService authService) {
		return new GoogleOAuthSuccessHandler(authService);
	}

}

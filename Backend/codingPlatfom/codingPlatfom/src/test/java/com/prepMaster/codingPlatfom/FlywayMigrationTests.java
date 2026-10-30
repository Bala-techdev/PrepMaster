package com.prepMaster.codingPlatfom;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Guards the schema pipeline: the context only starts if Flyway applied the
 * migrations, but that is easy to lose silently (for example by depending on
 * flyway-core instead of the Boot starter, which disables auto-configuration).
 */
@SpringBootTest
class FlywayMigrationTests {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void versionedMigrationsAreApplied() {
		Integer users = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);

		assertThat(users).isZero();
	}

}

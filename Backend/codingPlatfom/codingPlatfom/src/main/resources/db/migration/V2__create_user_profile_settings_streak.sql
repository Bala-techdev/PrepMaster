-- Phase 1: profile, settings and streak records.
--
-- Each row belongs to exactly one user through a NOT NULL foreign key, and the
-- UNIQUE constraint on user_id enforces the one-to-one relationship at database
-- level - application code alone must not be the only guarantee.
--
-- Column types stay portable between MySQL 8 and H2 (MODE=MySQL), matching the
-- TIMESTAMP(6) audit columns already established in V1.

CREATE TABLE user_profiles (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    user_id          BIGINT        NOT NULL,
    display_name     VARCHAR(80)   NOT NULL,
    headline         VARCHAR(160)  NULL,
    bio              VARCHAR(1000) NULL,
    avatar_url       VARCHAR(500)  NULL,
    location         VARCHAR(100)  NULL,
    target_role      VARCHAR(100)  NULL,
    experience_level VARCHAR(32)   NULL,
    github_url       VARCHAR(255)  NULL,
    linkedin_url     VARCHAR(255)  NULL,
    created_at       TIMESTAMP(6)  NOT NULL,
    updated_at       TIMESTAMP(6)  NOT NULL,
    CONSTRAINT pk_user_profiles PRIMARY KEY (id),
    CONSTRAINT uk_user_profiles_user_id UNIQUE (user_id),
    CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE user_settings (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    user_id             BIGINT       NOT NULL,
    theme               VARCHAR(16)  NOT NULL DEFAULT 'SYSTEM',
    email_notifications BOOLEAN      NOT NULL DEFAULT TRUE,
    daily_goal_minutes  INT          NOT NULL DEFAULT 60,
    reminder_time       TIME(6)      NULL,
    timezone            VARCHAR(64)  NOT NULL DEFAULT 'UTC',
    created_at          TIMESTAMP(6) NOT NULL,
    updated_at          TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_user_settings PRIMARY KEY (id),
    CONSTRAINT uk_user_settings_user_id UNIQUE (user_id),
    CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE user_streaks (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    user_id            BIGINT       NOT NULL,
    current_streak     INT          NOT NULL DEFAULT 0,
    longest_streak     INT          NOT NULL DEFAULT 0,
    total_active_days  INT          NOT NULL DEFAULT 0,
    last_activity_date DATE         NULL,
    created_at         TIMESTAMP(6) NOT NULL,
    updated_at         TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_user_streaks PRIMARY KEY (id),
    CONSTRAINT uk_user_streaks_user_id UNIQUE (user_id),
    CONSTRAINT fk_user_streaks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

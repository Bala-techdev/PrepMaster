-- Phase 6: community, leaderboard support, achievements and notifications.
--
-- All ranking inputs (XP, streak, completed tasks) already live in the
-- backend-owned tables. The new tables only add presentation/storage around
-- those facts; no client-supplied XP or rank is ever stored.

-- ---------------------------------------------------------------------------
-- Notification preferences on the existing settings row.
-- ---------------------------------------------------------------------------
ALTER TABLE user_settings ADD COLUMN notification_in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN notification_tasks BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN notification_achievements BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN notification_streaks BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN notification_community BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN notification_mock_interviews BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN notification_reminders BOOLEAN NOT NULL DEFAULT TRUE;

-- ---------------------------------------------------------------------------
-- Reusable achievement definitions. Existing definitions are upgraded in
-- place so already-awarded rows keep pointing at the same achievement ids.
-- ---------------------------------------------------------------------------
ALTER TABLE achievements ADD COLUMN criteria_type VARCHAR(40) NOT NULL DEFAULT 'MANUAL';
ALTER TABLE achievements ADD COLUMN threshold_value INT NOT NULL DEFAULT 0;
ALTER TABLE achievements ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE achievements SET criteria_type = 'TASKS_COMPLETED', threshold_value = 1 WHERE code = 'FIRST_TASK';
UPDATE achievements SET criteria_type = 'STREAK', threshold_value = 7 WHERE code = 'STREAK_7';
UPDATE achievements SET criteria_type = 'TOTAL_XP', threshold_value = 1000 WHERE code = 'XP_1000';
UPDATE achievements SET criteria_type = 'CATEGORIES_EXPLORED', threshold_value = 2 WHERE code = 'CATEGORY_EXPLORER';
UPDATE achievements SET criteria_type = 'ACTIVE_DAYS', threshold_value = 10 WHERE code = 'CONSISTENT_LEARNER';

INSERT INTO achievements (code, name, description, criteria_type, threshold_value, active) VALUES
    ('STREAK_30', 'Thirty-day streak', 'Keep a thirty-day learning streak alive.', 'STREAK', 30, TRUE),
    ('DSA_100', 'Century of questions', 'Solve 100 DSA practice questions.', 'DSA_SOLVED', 100, TRUE),
    ('XP_500', 'Five hundred XP', 'Earn 500 XP from completed tasks.', 'TOTAL_XP', 500, TRUE),
    ('MOCK_FIRST', 'First mock interview', 'Complete your first mock interview.', 'MOCK_COMPLETED', 1, TRUE),
    ('MOCK_10', 'Ten mock interviews', 'Complete ten mock interviews.', 'MOCK_COMPLETED', 10, TRUE);

-- ---------------------------------------------------------------------------
-- Community.
-- ---------------------------------------------------------------------------
CREATE TABLE community_posts (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    user_id    BIGINT        NOT NULL,
    title      VARCHAR(160)  NOT NULL,
    body       VARCHAR(4000) NOT NULL,
    topic      VARCHAR(40)   NOT NULL,
    created_at TIMESTAMP(6)  NOT NULL,
    updated_at TIMESTAMP(6)  NOT NULL,
    CONSTRAINT pk_community_posts PRIMARY KEY (id),
    CONSTRAINT fk_community_posts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_community_posts_created (created_at),
    INDEX idx_community_posts_user_created (user_id, created_at),
    INDEX idx_community_posts_topic_created (topic, created_at)
);

CREATE TABLE community_comments (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    post_id    BIGINT        NOT NULL,
    user_id    BIGINT        NOT NULL,
    body       VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP(6)  NOT NULL,
    updated_at TIMESTAMP(6)  NOT NULL,
    CONSTRAINT pk_community_comments PRIMARY KEY (id),
    CONSTRAINT fk_community_comments_post FOREIGN KEY (post_id) REFERENCES community_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_community_comments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_community_comments_post_created (post_id, created_at),
    INDEX idx_community_comments_user_created (user_id, created_at)
);

CREATE TABLE community_likes (
    post_id    BIGINT       NOT NULL,
    user_id    BIGINT       NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_community_likes PRIMARY KEY (post_id, user_id),
    CONSTRAINT fk_community_likes_post FOREIGN KEY (post_id) REFERENCES community_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_community_likes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_community_likes_user (user_id, created_at)
);

-- ---------------------------------------------------------------------------
-- Persistent in-app notifications. dedupe_key makes creation idempotent for
-- milestone-style events (task completion, achievement unlock, daily reminder).
-- Multiple NULLs are allowed so normal event notifications are never merged.
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    type       VARCHAR(40)  NOT NULL,
    title      VARCHAR(160) NOT NULL,
    message    VARCHAR(500) NOT NULL,
    link       VARCHAR(255) NULL,
    dedupe_key VARCHAR(160) NULL,
    read_at    TIMESTAMP(6) NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT uk_notifications_user_dedupe UNIQUE (user_id, dedupe_key),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_notifications_user_read_created (user_id, read_at, created_at)
);

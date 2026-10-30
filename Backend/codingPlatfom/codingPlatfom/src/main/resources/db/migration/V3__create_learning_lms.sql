CREATE TABLE learning_categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_learning_categories PRIMARY KEY (id),
    CONSTRAINT uk_learning_categories_name UNIQUE (name),
    CONSTRAINT uk_learning_categories_slug UNIQUE (slug)
);

CREATE TABLE learning_topics (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(160) NOT NULL,
    description VARCHAR(1000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_learning_topics PRIMARY KEY (id),
    CONSTRAINT uk_learning_topics_category_name UNIQUE (category_id, name),
    CONSTRAINT uk_learning_topics_category_slug UNIQUE (category_id, slug),
    CONSTRAINT fk_learning_topics_category FOREIGN KEY (category_id) REFERENCES learning_categories(id)
);

CREATE TABLE learning_resources (
    id BIGINT NOT NULL AUTO_INCREMENT,
    topic_id BIGINT NOT NULL,
    title VARCHAR(240) NOT NULL,
    description VARCHAR(2000),
    resource_url VARCHAR(1000) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_learning_resources PRIMARY KEY (id),
    CONSTRAINT fk_learning_resources_topic FOREIGN KEY (topic_id) REFERENCES learning_topics(id)
);

CREATE TABLE question_tags (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(80) NOT NULL,
    CONSTRAINT pk_question_tags PRIMARY KEY (id),
    CONSTRAINT uk_question_tags_name UNIQUE (name),
    CONSTRAINT uk_question_tags_slug UNIQUE (slug)
);

CREATE TABLE dsa_questions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    topic_id BIGINT NOT NULL,
    title VARCHAR(240) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(16) NOT NULL,
    constraints_text TEXT,
    examples_text TEXT,
    expected_time_complexity VARCHAR(80),
    expected_space_complexity VARCHAR(80),
    practice_url VARCHAR(1000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_dsa_questions PRIMARY KEY (id),
    CONSTRAINT fk_dsa_questions_topic FOREIGN KEY (topic_id) REFERENCES learning_topics(id),
    INDEX idx_dsa_questions_filter (topic_id, difficulty, active)
);

CREATE TABLE dsa_question_tags (
    question_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    CONSTRAINT pk_dsa_question_tags PRIMARY KEY (question_id, tag_id),
    CONSTRAINT fk_dsa_question_tags_question FOREIGN KEY (question_id) REFERENCES dsa_questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_dsa_question_tags_tag FOREIGN KEY (tag_id) REFERENCES question_tags(id) ON DELETE CASCADE
);

CREATE TABLE daily_plans (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    plan_date DATE NOT NULL,
    timezone VARCHAR(64) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_daily_plans PRIMARY KEY (id),
    CONSTRAINT uk_daily_plans_user_date UNIQUE (user_id, plan_date),
    CONSTRAINT fk_daily_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE daily_plan_tasks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    plan_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    question_id BIGINT,
    resource_id BIGINT,
    title VARCHAR(240) NOT NULL,
    task_order INT NOT NULL,
    task_status VARCHAR(16) NOT NULL,
    xp_reward INT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_daily_plan_tasks PRIMARY KEY (id),
    CONSTRAINT uk_daily_plan_tasks_order UNIQUE (plan_id, task_order),
    CONSTRAINT fk_daily_plan_tasks_plan FOREIGN KEY (plan_id) REFERENCES daily_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_daily_plan_tasks_category FOREIGN KEY (category_id) REFERENCES learning_categories(id),
    CONSTRAINT fk_daily_plan_tasks_question FOREIGN KEY (question_id) REFERENCES dsa_questions(id),
    CONSTRAINT fk_daily_plan_tasks_resource FOREIGN KEY (resource_id) REFERENCES learning_resources(id)
);

CREATE TABLE task_completions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    completed_at TIMESTAMP(6) NOT NULL,
    activity_date DATE NOT NULL,
    xp_awarded INT NOT NULL,
    CONSTRAINT pk_task_completions PRIMARY KEY (id),
    CONSTRAINT uk_task_completions_user_task UNIQUE (user_id, task_id),
    CONSTRAINT fk_task_completions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_completions_task FOREIGN KEY (task_id) REFERENCES daily_plan_tasks(id) ON DELETE CASCADE,
    INDEX idx_task_completions_user_date (user_id, activity_date)
);

CREATE TABLE user_progress (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    total_xp BIGINT NOT NULL DEFAULT 0,
    current_level INT NOT NULL DEFAULT 1,
    CONSTRAINT pk_user_progress PRIMARY KEY (id),
    CONSTRAINT uk_user_progress_user UNIQUE (user_id),
    CONSTRAINT fk_user_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_activity (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    activity_date DATE NOT NULL,
    completed_tasks INT NOT NULL DEFAULT 0,
    xp_earned BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT pk_user_activity PRIMARY KEY (id),
    CONSTRAINT uk_user_activity_user_date UNIQUE (user_id, activity_date),
    CONSTRAINT fk_user_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE achievements (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    description VARCHAR(500) NOT NULL,
    CONSTRAINT pk_achievements PRIMARY KEY (id),
    CONSTRAINT uk_achievements_code UNIQUE (code)
);

CREATE TABLE user_achievements (
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    awarded_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_user_achievements PRIMARY KEY (user_id, achievement_id),
    CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_achievements_achievement FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

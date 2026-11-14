-- Phase 5: backend-owned mock interview sessions.
--
-- Timestamps are written by the server (UTC). Client values are never used for
-- start/expiry/completion, so a stale or manipulated browser clock cannot grant
-- extra time or fabricate a result.

CREATE TABLE mock_interview_templates (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    user_id          BIGINT       NOT NULL,
    title            VARCHAR(160) NOT NULL,
    description      VARCHAR(1000) NULL,
    category         VARCHAR(40)  NOT NULL,
    difficulty       VARCHAR(16)  NOT NULL,
    duration_minutes INT          NOT NULL DEFAULT 45,
    created_at       TIMESTAMP(6) NOT NULL,
    updated_at       TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_mock_interview_templates PRIMARY KEY (id),
    CONSTRAINT fk_mock_interview_templates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_mock_interview_templates_user_created (user_id, created_at)
);

CREATE TABLE interview_sessions (
    id                        BIGINT       NOT NULL AUTO_INCREMENT,
    user_id                   BIGINT       NOT NULL,
    template_id               BIGINT       NOT NULL,
    category                  VARCHAR(40)  NOT NULL,
    difficulty                VARCHAR(16)  NOT NULL,
    duration_minutes          INT          NOT NULL,
    question_count            INT          NOT NULL,
    started_at                TIMESTAMP(6) NOT NULL,
    expires_at                TIMESTAMP(6) NOT NULL,
    completed_at              TIMESTAMP(6) NULL,
    status                    VARCHAR(16)  NOT NULL,
    focus_monitoring_consented BOOLEAN     NOT NULL DEFAULT FALSE,
    focus_loss_count          INT          NOT NULL DEFAULT 0,
    total_time_seconds        BIGINT       NULL,
    created_at                TIMESTAMP(6) NOT NULL,
    updated_at                TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_interview_sessions PRIMARY KEY (id),
    CONSTRAINT fk_interview_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_sessions_template FOREIGN KEY (template_id) REFERENCES mock_interview_templates (id),
    INDEX idx_interview_sessions_user_started (user_id, started_at),
    INDEX idx_interview_sessions_user_status (user_id, status)
);

CREATE TABLE interview_questions (
    id                         BIGINT       NOT NULL AUTO_INCREMENT,
    session_id                 BIGINT       NOT NULL,
    dsa_question_id            BIGINT       NULL,
    question_order             INT          NOT NULL,
    title                      VARCHAR(240) NOT NULL,
    prompt                     TEXT         NOT NULL,
    difficulty                 VARCHAR(16)  NOT NULL,
    topic                      VARCHAR(160) NULL,
    constraints_text           TEXT         NULL,
    examples_text              TEXT         NULL,
    expected_time_complexity   VARCHAR(80)  NULL,
    expected_space_complexity  VARCHAR(80)  NULL,
    created_at                 TIMESTAMP(6) NOT NULL,
    updated_at                 TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_interview_questions PRIMARY KEY (id),
    CONSTRAINT uk_interview_questions_session_order UNIQUE (session_id, question_order),
    CONSTRAINT fk_interview_questions_session FOREIGN KEY (session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_questions_dsa FOREIGN KEY (dsa_question_id) REFERENCES dsa_questions (id) ON DELETE SET NULL,
    INDEX idx_interview_questions_session (session_id)
);

CREATE TABLE interview_answers (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    session_id    BIGINT       NOT NULL,
    question_id   BIGINT       NOT NULL,
    answer_text   TEXT         NULL,
    code_text     TEXT         NULL,
    language      VARCHAR(32)  NULL,
    answered      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP(6) NOT NULL,
    updated_at    TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_interview_answers PRIMARY KEY (id),
    CONSTRAINT uk_interview_answers_question UNIQUE (question_id),
    CONSTRAINT fk_interview_answers_session FOREIGN KEY (session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_answers_question FOREIGN KEY (question_id) REFERENCES interview_questions (id) ON DELETE CASCADE
);

CREATE TABLE interview_focus_events (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    session_id  BIGINT       NOT NULL,
    event_type  VARCHAR(32)  NOT NULL,
    occurred_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_interview_focus_events PRIMARY KEY (id),
    CONSTRAINT fk_interview_focus_events_session FOREIGN KEY (session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE,
    INDEX idx_interview_focus_events_session (session_id, occurred_at)
);

CREATE TABLE interview_results (
    id                      BIGINT       NOT NULL AUTO_INCREMENT,
    session_id              BIGINT       NOT NULL,
    questions_assigned      INT          NOT NULL,
    questions_answered      INT          NOT NULL,
    completion_percentage   DOUBLE       NOT NULL,
    score                   DOUBLE       NOT NULL,
    measured_time_seconds   BIGINT       NOT NULL,
    estimated_time_seconds  BIGINT       NOT NULL,
    focus_loss_count        INT          NOT NULL DEFAULT 0,
    overall_feedback        VARCHAR(1000) NULL,
    created_at              TIMESTAMP(6) NOT NULL,
    updated_at              TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_interview_results PRIMARY KEY (id),
    CONSTRAINT uk_interview_results_session UNIQUE (session_id),
    CONSTRAINT fk_interview_results_session FOREIGN KEY (session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE
);

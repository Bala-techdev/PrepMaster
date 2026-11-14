ALTER TABLE dsa_questions ADD COLUMN test_cases LONGTEXT NULL;

CREATE TABLE dsa_submissions (
    id                  BIGINT NOT NULL AUTO_INCREMENT,
    user_id             BIGINT NOT NULL,
    question_id         BIGINT NOT NULL,
    language            VARCHAR(16) NOT NULL,
    source_code         LONGTEXT NOT NULL,
    status              VARCHAR(24) NOT NULL,
    stdout              LONGTEXT NULL,
    stderr              LONGTEXT NULL,
    execution_time_ms   BIGINT NOT NULL DEFAULT 0,
    passed              BOOLEAN NOT NULL DEFAULT FALSE,
    xp_awarded          INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMP(6) NOT NULL,
    updated_at          TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_dsa_submissions PRIMARY KEY (id),
    CONSTRAINT fk_dsa_submissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_dsa_submissions_question FOREIGN KEY (question_id) REFERENCES dsa_questions(id) ON DELETE CASCADE
);

CREATE INDEX ix_dsa_submissions_user_created ON dsa_submissions(user_id, created_at);
CREATE INDEX ix_dsa_submissions_user_question ON dsa_submissions(user_id, question_id, passed);

INSERT INTO achievements (code, name, description, criteria_type, threshold_value, active)
SELECT 'FIRST_CODE_SUBMISSION', 'First Problem Solved', 'Pass your first coding-arena problem.', 'CODE_SUBMISSIONS', 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE code = 'FIRST_CODE_SUBMISSION');

INSERT INTO achievements (code, name, description, criteria_type, threshold_value, active)
SELECT 'CODE_100', '100 Problems Solved', 'Pass 100 distinct coding-arena problems.', 'CODE_SUBMISSIONS', 100, TRUE
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE code = 'CODE_100');

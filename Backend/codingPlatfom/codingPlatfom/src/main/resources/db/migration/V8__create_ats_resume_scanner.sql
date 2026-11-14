ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(16) NOT NULL DEFAULT 'FREE';

CREATE TABLE resumes (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    user_id         BIGINT       NOT NULL,
    original_name   VARCHAR(255) NOT NULL,
    storage_key     VARCHAR(255) NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    file_size       BIGINT       NOT NULL,
    sha256_hash     VARCHAR(128) NOT NULL,
    extracted_name  VARCHAR(160) NULL,
    extracted_email VARCHAR(255) NULL,
    extracted_phone VARCHAR(80) NULL,
    education       TEXT         NULL,
    technical_skills TEXT        NULL,
    programming_languages TEXT   NULL,
    frameworks      TEXT         NULL,
    `databases`     TEXT         NULL,
    projects        TEXT         NULL,
    work_experience TEXT         NULL,
    certifications  TEXT         NULL,
    extracted_text  LONGTEXT     NOT NULL,
    created_at      TIMESTAMP(6) NOT NULL,
    updated_at      TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_resumes PRIMARY KEY (id),
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX ix_resumes_user_created ON resumes(user_id, created_at);
CREATE UNIQUE INDEX uk_resumes_user_hash ON resumes(user_id, sha256_hash);

CREATE TABLE resume_scans (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    user_id               BIGINT       NOT NULL,
    resume_id             BIGINT       NOT NULL,
    target_company        VARCHAR(120) NULL,
    target_role           VARCHAR(160) NULL,
    job_description       LONGTEXT     NOT NULL,
    job_requirements      TEXT         NULL,
    ats_score             INT          NOT NULL,
    readiness_score       INT          NOT NULL,
    technical_coverage    INT          NOT NULL,
    matched_skills        TEXT         NULL,
    missing_skills        TEXT         NULL,
    partial_skills        TEXT         NULL,
    strengths             TEXT         NULL,
    recommendations       TEXT         NULL,
    status                VARCHAR(24)  NOT NULL,
    error_message         VARCHAR(500) NULL,
    created_at            TIMESTAMP(6) NOT NULL,
    updated_at            TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_resume_scans PRIMARY KEY (id),
    CONSTRAINT fk_resume_scans_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_resume_scans_resume FOREIGN KEY (resume_id) REFERENCES resumes(id)
);

CREATE INDEX ix_resume_scans_user_created ON resume_scans(user_id, created_at);
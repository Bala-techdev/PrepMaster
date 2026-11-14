ALTER TABLE users ADD COLUMN role VARCHAR(16) NOT NULL DEFAULT 'USER';
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(32) NOT NULL DEFAULT 'LOCAL';

CREATE TABLE auth_tokens (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    user_id       BIGINT       NOT NULL,
    token_hash    VARCHAR(128) NOT NULL,
    token_type    VARCHAR(32)  NOT NULL,
    expires_at    TIMESTAMP(6) NOT NULL,
    consumed_at   TIMESTAMP(6) NULL,
    revoked_at    TIMESTAMP(6) NULL,
    created_at    TIMESTAMP(6) NOT NULL,
    updated_at    TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_auth_tokens PRIMARY KEY (id),
    CONSTRAINT uk_auth_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_auth_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX ix_auth_tokens_user_type ON auth_tokens(user_id, token_type);
CREATE INDEX ix_auth_tokens_expiry ON auth_tokens(expires_at);

CREATE TABLE login_history (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    user_id         BIGINT       NULL,
    email           VARCHAR(255) NOT NULL,
    ip_address      VARCHAR(64)  NULL,
    user_agent      VARCHAR(1000) NULL,
    device_info     VARCHAR(255) NULL,
    location        VARCHAR(255) NULL,
    successful      BOOLEAN      NOT NULL,
    failure_reason  VARCHAR(255) NULL,
    occurred_at     TIMESTAMP(6) NOT NULL,
    created_at      TIMESTAMP(6) NOT NULL,
    updated_at      TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_login_history PRIMARY KEY (id),
    CONSTRAINT fk_login_history_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX ix_login_history_user_time ON login_history(user_id, occurred_at);
CREATE INDEX ix_login_history_email_time ON login_history(email, occurred_at);

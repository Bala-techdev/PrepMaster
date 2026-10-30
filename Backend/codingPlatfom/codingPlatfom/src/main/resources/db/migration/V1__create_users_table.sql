-- Core account table.
--
-- Deliberately portable between MySQL 8 and H2 (MODE=MySQL) so that the same
-- migration is executed by the tests and by the real development database.
-- Database-level defaults (utf8mb4, InnoDB) are left to the schema itself
-- because H2 does not understand MySQL's ENGINE/CHARSET clauses.

CREATE TABLE users (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    email         VARCHAR(255) NOT NULL,
    username      VARCHAR(50)  NOT NULL,
    password_hash VARCHAR(255) NULL,
    status        VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP(6) NOT NULL,
    updated_at    TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_username UNIQUE (username)
);

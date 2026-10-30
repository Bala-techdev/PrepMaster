package com.prepMaster.codingPlatfom.entity;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

/**
 * Audit columns shared by every persistent entity.
 *
 * <p>Timestamps are recorded in UTC. The database stores them without a zone
 * ({@code hibernate.jdbc.time_zone=UTC} keeps the JDBC conversion aligned).</p>
 */
@MappedSuperclass
public abstract class AuditableEntity {

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@PrePersist
	void onPersist() {
		LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
		if (createdAt == null) {
			createdAt = now;
		}
		updatedAt = now;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = LocalDateTime.now(ZoneOffset.UTC);
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}

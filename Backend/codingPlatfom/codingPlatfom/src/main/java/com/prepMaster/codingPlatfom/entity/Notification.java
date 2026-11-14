package com.prepMaster.codingPlatfom.entity;

import java.time.Instant;

import com.prepMaster.codingPlatfom.entity.enums.NotificationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notifications",
		uniqueConstraints = @UniqueConstraint(name = "uk_notifications_user_dedupe",
				columnNames = { "user_id", "dedupe_key" }),
		indexes = @Index(name = "idx_notifications_user_read_created",
				columnList = "user_id, read_at, created_at"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private NotificationType type;

	@Column(nullable = false, length = 160)
	private String title;

	@Column(nullable = false, length = 500)
	private String message;

	@Column(length = 255)
	private String link;

	@Column(name = "dedupe_key", length = 160)
	private String dedupeKey;

	@Column(name = "read_at")
	private Instant readAt;

	public Notification(User user, NotificationType type, String title, String message, String link,
			String dedupeKey) {
		this.user = user;
		this.type = type;
		this.title = title;
		this.message = message;
		this.link = link;
		this.dedupeKey = dedupeKey;
	}

	public void markRead(Instant at) {
		if (readAt == null) {
			readAt = at;
		}
	}
}

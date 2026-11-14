package com.prepMaster.codingPlatfom.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "login_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoginHistory extends AuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	@Column(nullable = false, length = 255)
	private String email;

	@Column(name = "ip_address", length = 64)
	private String ipAddress;

	@Column(name = "user_agent", length = 1000)
	private String userAgent;

	@Column(name = "device_info", length = 255)
	private String deviceInfo;

	@Column(length = 255)
	private String location;

	@Column(nullable = false)
	private boolean successful;

	@Column(name = "failure_reason", length = 255)
	private String failureReason;

	@Column(name = "occurred_at", nullable = false)
	private LocalDateTime occurredAt;

	public LoginHistory(User user, String email, String ipAddress, String userAgent,
			String deviceInfo, String location, boolean successful, String failureReason,
			LocalDateTime occurredAt) {
		this.user = user;
		this.email = email;
		this.ipAddress = ipAddress;
		this.userAgent = userAgent;
		this.deviceInfo = deviceInfo;
		this.location = location;
		this.successful = successful;
		this.failureReason = failureReason;
		this.occurredAt = occurredAt;
	}
}

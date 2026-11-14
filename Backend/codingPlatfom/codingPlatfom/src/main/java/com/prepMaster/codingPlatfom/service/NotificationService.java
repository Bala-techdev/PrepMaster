package com.prepMaster.codingPlatfom.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.response.NotificationResponses.NotificationView;
import com.prepMaster.codingPlatfom.dto.response.NotificationResponses.Paged;
import com.prepMaster.codingPlatfom.entity.Notification;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.entity.UserSettings;
import com.prepMaster.codingPlatfom.entity.enums.NotificationType;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.repository.NotificationRepository;
import com.prepMaster.codingPlatfom.repository.UserSettingsRepository;
import com.prepMaster.codingPlatfom.service.UserService;

/**
 * In-app notifications only. There is no e-mail/SMS/push provider here; every
 * row is scoped to one user and created by a backend event.
 */
@Service
@Transactional
public class NotificationService {

	private final NotificationRepository notifications;
	private final UserSettingsRepository settingsRepository;
	private final UserService users;

	public NotificationService(NotificationRepository notifications, UserSettingsRepository settingsRepository,
			UserService users) {
		this.notifications = notifications;
		this.settingsRepository = settingsRepository;
		this.users = users;
	}

	/**
	 * Creates a notification when the user's preferences allow the type. The
	 * dedupe key makes milestone notifications idempotent.
	 */
	public boolean create(Long userId, NotificationType type, String title, String message, String link,
			String dedupeKey) {
		UserSettings settings = settingsRepository.findByUserId(userId).orElse(null);
		if (!allowed(settings, type)) {
			return false;
		}
		if (dedupeKey != null && notifications.existsByUserIdAndDedupeKey(userId, dedupeKey)) {
			return false;
		}
		User user = users.require(userId);
		notifications.save(new Notification(user, type, trim(title, 160), trim(message, 500), trim(link, 255),
				trim(dedupeKey, 160)));
		return true;
	}

	public void deleteByDedupeKey(Long userId, String dedupeKey) {
		if (dedupeKey != null) {
			notifications.deleteByUserIdAndDedupeKey(userId, dedupeKey);
		}
	}

	public Paged<NotificationView> list(Long userId, int page, int size, boolean unreadOnly) {
		ensureDailyReminder(userId);
		int safePage = Math.max(0, page);
		int safeSize = Math.min(50, Math.max(1, size));
		Page<Notification> rows = unreadOnly
				? notifications.findByUserIdAndReadAtIsNullOrderByCreatedAtDesc(userId,
						PageRequest.of(safePage, safeSize))
				: notifications.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(safePage, safeSize));
		return new Paged<>(rows.getContent().stream().map(this::toView).toList(), rows.getNumber(), rows.getSize(),
				rows.getTotalElements(), rows.getTotalPages());
	}

	public long unreadCount(Long userId) {
		ensureDailyReminder(userId);
		return notifications.countByUserIdAndReadAtIsNull(userId);
	}

	public NotificationView markRead(Long userId, Long notificationId) {
		Notification notification = notifications.findByIdAndUserId(notificationId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
		notification.markRead(Instant.now());
		return toView(notification);
	}

	public int markAllRead(Long userId) {
		return notifications.markAllRead(userId, Instant.now());
	}

	/**
	 * Lazily creates today's reminder when the user has enabled reminders, has a
	 * reminder time configured and that time has passed. A unique dedupe key per
	 * user/day prevents duplicates, including across repeated page loads.
	 */
	private void ensureDailyReminder(Long userId) {
		UserSettings settings = settingsRepository.findByUserId(userId).orElse(null);
		if (settings == null || !settings.isNotificationInAppEnabled() || !settings.isNotificationReminders()
				|| settings.getReminderTime() == null) {
			return;
		}
		ZoneId zone = zone(settings.getTimezone());
		LocalDate today = LocalDate.now(zone);
		LocalTime now = LocalTime.now(zone);
		if (now.isBefore(settings.getReminderTime())) {
			return;
		}
		String key = "REMINDER:" + today;
		if (notifications.existsByUserIdAndDedupeKey(userId, key)) {
			return;
		}
		create(userId, NotificationType.REMINDER, "Time to practice",
				"Your daily goal is " + settings.getDailyGoalMinutes()
						+ " minutes. A short session keeps your streak moving.",
				"/daily-plan", key);
	}

	private boolean allowed(UserSettings settings, NotificationType type) {
		if (settings == null) {
			return true;
		}
		if (!settings.isNotificationInAppEnabled()) {
			return false;
		}
		return switch (type) {
			case TASK_COMPLETED -> settings.isNotificationTasks();
			case ACHIEVEMENT_UNLOCKED -> settings.isNotificationAchievements();
			case STREAK -> settings.isNotificationStreaks();
			case COMMUNITY_ACTIVITY -> settings.isNotificationCommunity();
			case MOCK_INTERVIEW_RESULT -> settings.isNotificationMockInterviews();
			case REMINDER -> settings.isNotificationReminders();
			case SYSTEM -> true;
		};
	}

	private NotificationView toView(Notification notification) {
		LocalDateTime created = notification.getCreatedAt();
		Instant createdAt = created == null ? Instant.now() : created.toInstant(ZoneOffset.UTC);
		return new NotificationView(notification.getId(), notification.getType(), notification.getTitle(),
				notification.getMessage(), notification.getLink(), notification.getReadAt() != null, createdAt,
				notification.getReadAt());
	}

	private static ZoneId zone(String timezone) {
		try {
			return ZoneId.of(timezone);
		} catch (RuntimeException exception) {
			return ZoneOffset.UTC;
		}
	}

	private static String trim(String value, int max) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
	}
}

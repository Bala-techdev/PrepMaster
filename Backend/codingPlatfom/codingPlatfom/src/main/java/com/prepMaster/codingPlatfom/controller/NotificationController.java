package com.prepMaster.codingPlatfom.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prepMaster.codingPlatfom.dto.response.NotificationResponses.NotificationView;
import com.prepMaster.codingPlatfom.dto.response.NotificationResponses.Paged;
import com.prepMaster.codingPlatfom.dto.response.NotificationResponses.UnreadCount;
import com.prepMaster.codingPlatfom.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final NotificationService notifications;

	public NotificationController(NotificationService notifications) {
		this.notifications = notifications;
	}

	@GetMapping
	public Paged<NotificationView> list(Authentication authentication,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
			@RequestParam(defaultValue = "false") boolean unreadOnly) {
		return notifications.list(userId(authentication), page, size, unreadOnly);
	}

	@GetMapping("/unread-count")
	public UnreadCount unreadCount(Authentication authentication) {
		return new UnreadCount(notifications.unreadCount(userId(authentication)));
	}

	@PostMapping("/{notificationId}/read")
	public NotificationView markRead(Authentication authentication, @PathVariable Long notificationId) {
		return notifications.markRead(userId(authentication), notificationId);
	}

	@PostMapping("/read-all")
	public UnreadCount markAllRead(Authentication authentication) {
		notifications.markAllRead(userId(authentication));
		return new UnreadCount(notifications.unreadCount(userId(authentication)));
	}

	private static Long userId(Authentication authentication) {
		return Long.parseLong(authentication.getName());
	}
}

package com.prepMaster.codingPlatfom.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.response.LoginHistoryResponse;
import com.prepMaster.codingPlatfom.entity.LoginHistory;
import com.prepMaster.codingPlatfom.entity.User;
import com.prepMaster.codingPlatfom.repository.LoginHistoryRepository;

@Service
@Transactional
public class LoginHistoryService {

	private final LoginHistoryRepository history;

	public LoginHistoryService(LoginHistoryRepository history) {
		this.history = history;
	}

	public void record(User user, String email, HttpServletRequest request, boolean successful, String reason) {
		String userAgent = request == null ? null : request.getHeader("User-Agent");
		String ip = request == null ? null : request.getRemoteAddr();
		String device = userAgent == null ? null : userAgent.length() > 255 ? userAgent.substring(0, 255) : userAgent;
		history.save(new LoginHistory(user, email, ip, userAgent, device, null, successful, reason,
				LocalDateTime.now(ZoneOffset.UTC)));
	}

	@Transactional(readOnly = true)
	public java.util.List<LoginHistoryResponse> recent(Long userId) {
		return history.findTop50ByUserIdOrderByOccurredAtDesc(userId).stream()
				.map(item -> new LoginHistoryResponse(item.getId(), item.getEmail(), item.getIpAddress(),
						item.getUserAgent(), item.getDeviceInfo(), item.getLocation(), item.isSuccessful(),
						item.getFailureReason(), item.getOccurredAt()))
				.toList();
	}
}

package com.prepMaster.codingPlatfom.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.request.UpdateUserSettingsRequest;
import com.prepMaster.codingPlatfom.dto.response.UserSettingsResponse;
import com.prepMaster.codingPlatfom.entity.UserSettings;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.mapper.UserMapper;
import com.prepMaster.codingPlatfom.repository.UserSettingsRepository;

@Service
@Transactional
public class UserSettingsService {

	private final UserSettingsRepository userSettingsRepository;

	public UserSettingsService(UserSettingsRepository userSettingsRepository) {
		this.userSettingsRepository = userSettingsRepository;
	}

	@Transactional(readOnly = true)
	public UserSettingsResponse getByUserId(Long userId) {
		return UserMapper.toSettingsResponse(requireSettings(userId));
	}

	public UserSettingsResponse update(Long userId, UpdateUserSettingsRequest request) {
		UserSettings settings = requireSettings(userId);
		settings.setTheme(request.theme());
		settings.setEmailNotifications(request.emailNotifications());
		settings.setDailyGoalMinutes(request.dailyGoalMinutes());
		settings.setReminderTime(request.reminderTime());
		settings.setTimezone(request.timezone().trim());
		return UserMapper.toSettingsResponse(settings);
	}

	private UserSettings requireSettings(Long userId) {
		return userSettingsRepository.findByUserId(userId)
				.orElseThrow(() -> new ResourceNotFoundException("Settings not found for user: " + userId));
	}
}

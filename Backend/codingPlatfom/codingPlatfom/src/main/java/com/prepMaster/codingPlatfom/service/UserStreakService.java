package com.prepMaster.codingPlatfom.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prepMaster.codingPlatfom.dto.response.UserStreakResponse;
import com.prepMaster.codingPlatfom.entity.UserStreak;
import com.prepMaster.codingPlatfom.exception.ResourceNotFoundException;
import com.prepMaster.codingPlatfom.mapper.UserMapper;
import com.prepMaster.codingPlatfom.repository.UserStreakRepository;

@Service
@Transactional
public class UserStreakService {

	private final UserStreakRepository userStreakRepository;

	public UserStreakService(UserStreakRepository userStreakRepository) {
		this.userStreakRepository = userStreakRepository;
	}

	@Transactional(readOnly = true)
	public UserStreakResponse getByUserId(Long userId) {
		return UserMapper.toStreakResponse(requireStreak(userId));
	}

	public UserStreakResponse recordActivity(Long userId, LocalDate activityDate) {
		UserStreak streak = requireStreak(userId);
		streak.recordActivity(activityDate);
		return UserMapper.toStreakResponse(streak);
	}

	private UserStreak requireStreak(Long userId) {
		return userStreakRepository.findByUserId(userId)
				.orElseThrow(() -> new ResourceNotFoundException("Streak not found for user: " + userId));
	}
}

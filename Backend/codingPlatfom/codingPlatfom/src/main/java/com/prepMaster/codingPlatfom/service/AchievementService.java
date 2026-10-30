package com.prepMaster.codingPlatfom.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.prepMaster.codingPlatfom.dto.response.ProgressResponses.Achievement;
import com.prepMaster.codingPlatfom.repository.AchievementRepository;

@Service
@Transactional(readOnly = true)
public class AchievementService {
	private final AchievementRepository repository;
	public AchievementService(AchievementRepository repository) { this.repository = repository; }
	public List<Achievement> all() { return repository.findAll().stream().map(a -> new Achievement(a.getId(), a.getCode(), a.getName(), a.getDescription())).toList(); }
}

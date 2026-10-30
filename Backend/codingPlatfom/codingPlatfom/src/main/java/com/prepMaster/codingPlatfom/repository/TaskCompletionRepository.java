package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prepMaster.codingPlatfom.entity.TaskCompletion;

public interface TaskCompletionRepository extends JpaRepository<TaskCompletion, Long> {
	Optional<TaskCompletion> findByUserIdAndTaskId(Long userId, Long taskId);
	List<TaskCompletion> findByUserIdOrderByCompletedAtDesc(Long userId);
	long countByUserId(Long userId);
	List<TaskCompletion> findByUserIdAndCompletedAtBetween(Long userId, java.time.Instant from, java.time.Instant to);
}

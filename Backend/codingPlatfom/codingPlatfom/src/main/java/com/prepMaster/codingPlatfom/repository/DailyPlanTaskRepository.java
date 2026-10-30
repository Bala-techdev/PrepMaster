package com.prepMaster.codingPlatfom.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prepMaster.codingPlatfom.entity.DailyPlanTask;

public interface DailyPlanTaskRepository extends JpaRepository<DailyPlanTask, Long> {
	Optional<DailyPlanTask> findByIdAndPlanUserId(Long id, Long userId);
}

package com.prepMaster.codingPlatfom.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prepMaster.codingPlatfom.entity.DailyPlan;

public interface DailyPlanRepository extends JpaRepository<DailyPlan, Long> {
	Optional<DailyPlan> findByUserIdAndPlanDate(Long userId, LocalDate planDate);
	List<DailyPlan> findByUserId(Long userId);
}

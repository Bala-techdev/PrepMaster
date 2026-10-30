package com.prepMaster.codingPlatfom.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prepMaster.codingPlatfom.entity.UserActivity;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
	Optional<UserActivity> findByUserIdAndActivityDate(Long userId, LocalDate date);
	List<UserActivity> findByUserIdAndActivityDateBetweenOrderByActivityDateAsc(Long userId, LocalDate from, LocalDate to);
}

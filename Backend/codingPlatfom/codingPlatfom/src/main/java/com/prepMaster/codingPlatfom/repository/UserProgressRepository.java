package com.prepMaster.codingPlatfom.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prepMaster.codingPlatfom.entity.UserProgress;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
	Optional<UserProgress> findByUserId(Long userId);
}

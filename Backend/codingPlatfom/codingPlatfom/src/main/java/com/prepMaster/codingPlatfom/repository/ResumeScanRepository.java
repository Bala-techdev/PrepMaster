package com.prepMaster.codingPlatfom.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.ResumeScan;

public interface ResumeScanRepository extends JpaRepository<ResumeScan, Long> {
	long countByUserIdAndCreatedAtGreaterThanEqual(Long userId, LocalDateTime from);
	List<ResumeScan> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);
	Optional<ResumeScan> findTopByUserIdAndResumeIdAndJobDescriptionOrderByCreatedAtDesc(
			Long userId, Long resumeId, String jobDescription);
	Optional<ResumeScan> findByIdAndUserId(Long id, Long userId);
}

package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prepMaster.codingPlatfom.entity.InterviewSession;
import com.prepMaster.codingPlatfom.entity.enums.InterviewStatus;

import jakarta.persistence.LockModeType;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select s from InterviewSession s where s.id = :id")
	Optional<InterviewSession> findByIdForUpdate(@Param("id") Long id);

	Optional<InterviewSession> findFirstByUserIdAndStatusOrderByStartedAtDesc(Long userId, InterviewStatus status);

	List<InterviewSession> findByUserIdAndStatus(Long userId, InterviewStatus status);

	Page<InterviewSession> findByUserIdOrderByStartedAtDesc(Long userId, Pageable pageable);

	java.util.List<InterviewSession> findByUserIdOrderByStartedAtDesc(Long userId);

	long countByUserId(Long userId);

	long countByUserIdAndStatus(Long userId, InterviewStatus status);

	long countByUserIdAndStatusIn(Long userId, java.util.Collection<InterviewStatus> statuses);
}

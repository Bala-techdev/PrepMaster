package com.prepMaster.codingPlatfom.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.InterviewResult;

public interface InterviewResultRepository extends JpaRepository<InterviewResult, Long> {

	Optional<InterviewResult> findBySessionId(Long sessionId);

	boolean existsBySessionId(Long sessionId);
}

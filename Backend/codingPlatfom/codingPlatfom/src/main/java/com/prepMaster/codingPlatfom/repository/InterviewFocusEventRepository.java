package com.prepMaster.codingPlatfom.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.InterviewFocusEvent;

public interface InterviewFocusEventRepository extends JpaRepository<InterviewFocusEvent, Long> {

	long countBySessionId(Long sessionId);
}

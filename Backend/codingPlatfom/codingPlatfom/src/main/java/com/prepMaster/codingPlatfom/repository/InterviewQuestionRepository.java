package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.InterviewQuestion;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {

	List<InterviewQuestion> findBySessionIdOrderByPositionAsc(Long sessionId);

	Optional<InterviewQuestion> findByIdAndSessionId(Long id, Long sessionId);

	long countBySessionId(Long sessionId);
}

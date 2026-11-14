package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.InterviewAnswer;

public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, Long> {

	Optional<InterviewAnswer> findByQuestionId(Long questionId);

	Optional<InterviewAnswer> findBySessionIdAndQuestionId(Long sessionId, Long questionId);

	List<InterviewAnswer> findBySessionId(Long sessionId);

	long countBySessionIdAndAnsweredTrue(Long sessionId);
}

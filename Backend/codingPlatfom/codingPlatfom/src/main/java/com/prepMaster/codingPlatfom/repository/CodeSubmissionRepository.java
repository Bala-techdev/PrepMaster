package com.prepMaster.codingPlatfom.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.CodeSubmission;

public interface CodeSubmissionRepository extends JpaRepository<CodeSubmission, Long> {
	boolean existsByUserIdAndQuestionIdAndPassedTrue(Long userId, Long questionId);
	List<CodeSubmission> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);

	@org.springframework.data.jpa.repository.Query("select count(distinct s.question.id) from CodeSubmission s where s.user.id = :userId and s.passed = true")
	long countDistinctPassedQuestions(@org.springframework.data.repository.query.Param("userId") Long userId);
}

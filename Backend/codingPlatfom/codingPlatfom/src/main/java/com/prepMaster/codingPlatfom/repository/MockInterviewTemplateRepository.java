package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.MockInterviewTemplate;

public interface MockInterviewTemplateRepository extends JpaRepository<MockInterviewTemplate, Long> {

	List<MockInterviewTemplate> findByUserIdOrderByCreatedAtDesc(Long userId);

	Optional<MockInterviewTemplate> findByIdAndUserId(Long id, Long userId);
}

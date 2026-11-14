package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prepMaster.codingPlatfom.entity.LearningTopic;

public interface LearningTopicRepository extends JpaRepository<LearningTopic, Long> {
	List<LearningTopic> findByCategoryIdAndActiveTrueOrderByNameAsc(Long categoryId);
	List<LearningTopic> findByActiveTrueOrderByNameAsc();
}

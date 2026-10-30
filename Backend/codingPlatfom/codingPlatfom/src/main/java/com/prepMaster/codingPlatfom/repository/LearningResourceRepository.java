package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prepMaster.codingPlatfom.entity.LearningResource;

public interface LearningResourceRepository extends JpaRepository<LearningResource, Long> {
	List<LearningResource> findByTopicIdAndActiveTrueOrderByTitleAsc(Long topicId);
}

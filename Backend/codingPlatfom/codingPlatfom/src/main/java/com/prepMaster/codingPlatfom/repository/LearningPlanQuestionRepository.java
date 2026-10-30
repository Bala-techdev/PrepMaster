package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prepMaster.codingPlatfom.entity.DSAQuestion;

public interface LearningPlanQuestionRepository extends JpaRepository<DSAQuestion, Long> {
	List<DSAQuestion> findByTopicCategoryIdInAndActiveTrue(java.util.Collection<Long> categoryIds);
}

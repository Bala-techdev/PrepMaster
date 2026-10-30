package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prepMaster.codingPlatfom.entity.LearningCategory;

public interface LearningCategoryRepository extends JpaRepository<LearningCategory, Long> {
	List<LearningCategory> findByActiveTrueOrderByNameAsc();
	Optional<LearningCategory> findBySlug(String slug);
}

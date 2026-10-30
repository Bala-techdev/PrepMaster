package com.prepMaster.codingPlatfom.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.prepMaster.codingPlatfom.entity.DSAQuestion;
import com.prepMaster.codingPlatfom.entity.enums.Difficulty;

public interface DSAQuestionRepository extends JpaRepository<DSAQuestion, Long> {
	@Query("select distinct q from DSAQuestion q join fetch q.topic t join fetch t.category c left join fetch q.tags " +
			"where q.active = true and (:difficulty is null or q.difficulty = :difficulty) " +
			"and (:topicId is null or t.id = :topicId) " +
			"and (:search is null or lower(q.title) like lower(concat('%', :search, '%')) " +
			"or lower(q.description) like lower(concat('%', :search, '%')) " +
			"or lower(t.name) like lower(concat('%', :search, '%')) " +
			"or lower(c.name) like lower(concat('%', :search, '%')))")
	Page<DSAQuestion> search(@Param("difficulty") Difficulty difficulty, @Param("topicId") Long topicId,
			@Param("search") String search, Pageable pageable);

	java.util.Optional<DSAQuestion> findByIdAndActiveTrue(Long id);

	long countByTopicCategoryIdAndActiveTrue(Long categoryId);
}

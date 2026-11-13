package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prepMaster.codingPlatfom.entity.TaskCompletion;

public interface TaskCompletionRepository extends JpaRepository<TaskCompletion, Long> {
	Optional<TaskCompletion> findByUserIdAndTaskId(Long userId, Long taskId);
	List<TaskCompletion> findByUserIdOrderByCompletedAtDesc(Long userId);
	long countByUserId(Long userId);
	List<TaskCompletion> findByUserIdAndCompletedAtBetween(Long userId, java.time.Instant from, java.time.Instant to);

	@Query("select count(distinct c.task.question.id) from TaskCompletion c " +
			"where c.user.id = :userId and c.task.question is not null")
	long countDistinctSolvedQuestions(@Param("userId") Long userId);

	@Query("select count(distinct c.task.category.id) from TaskCompletion c where c.user.id = :userId")
	long countDistinctCategories(@Param("userId") Long userId);

	@Query("select c.user.id, count(c) from TaskCompletion c group by c.user.id")
	List<Object[]> countAllGroupedByUser();
}

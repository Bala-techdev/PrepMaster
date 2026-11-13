package com.prepMaster.codingPlatfom.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.prepMaster.codingPlatfom.entity.UserActivity;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
	Optional<UserActivity> findByUserIdAndActivityDate(Long userId, LocalDate date);
	List<UserActivity> findByUserIdAndActivityDateBetweenOrderByActivityDateAsc(Long userId, LocalDate from, LocalDate to);

	@Query("select a.user.id, coalesce(sum(a.xpEarned), 0) from UserActivity a " +
			"where a.activityDate between :from and :to group by a.user.id")
	List<Object[]> sumXpGroupedByUser(@Param("from") LocalDate from, @Param("to") LocalDate to);

	@Query("select a.user.id, coalesce(sum(a.completedTasks), 0) from UserActivity a " +
			"where a.activityDate between :from and :to group by a.user.id")
	List<Object[]> sumCompletedTasksGroupedByUser(@Param("from") LocalDate from, @Param("to") LocalDate to);

	@Query("select coalesce(sum(a.xpEarned), 0) from UserActivity a where a.user.id = :userId " +
			"and a.activityDate between :from and :to")
	long sumXpForUser(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

	@Query("select coalesce(sum(a.completedTasks), 0) from UserActivity a where a.user.id = :userId " +
			"and a.activityDate between :from and :to")
	long sumCompletedTasksForUser(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}

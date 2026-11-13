package com.prepMaster.codingPlatfom.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prepMaster.codingPlatfom.entity.UserAchievement;
import com.prepMaster.codingPlatfom.entity.UserAchievementId;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, UserAchievementId> {

	@Query("select ua from UserAchievement ua join fetch ua.achievement where ua.id.userId = :userId")
	List<UserAchievement> findAllForUser(@Param("userId") Long userId);

	boolean existsByIdUserIdAndIdAchievementId(Long userId, Long achievementId);

	long countByIdUserId(Long userId);

	long countByIdUserIdAndIdAchievementId(Long userId, Long achievementId);
}

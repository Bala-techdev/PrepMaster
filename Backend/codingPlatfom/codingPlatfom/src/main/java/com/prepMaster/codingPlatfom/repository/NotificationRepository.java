package com.prepMaster.codingPlatfom.repository;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prepMaster.codingPlatfom.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

	Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

	Page<Notification> findByUserIdAndReadAtIsNullOrderByCreatedAtDesc(Long userId, Pageable pageable);

	long countByUserIdAndReadAtIsNull(Long userId);

	Optional<Notification> findByIdAndUserId(Long id, Long userId);

	boolean existsByUserIdAndDedupeKey(Long userId, String dedupeKey);

	long countByUserIdAndDedupeKey(Long userId, String dedupeKey);

	void deleteByUserIdAndDedupeKey(Long userId, String dedupeKey);

	@Modifying(clearAutomatically = true)
	@Query("update Notification n set n.readAt = :readAt where n.user.id = :userId and n.readAt is null")
	int markAllRead(@Param("userId") Long userId, @Param("readAt") Instant readAt);
}

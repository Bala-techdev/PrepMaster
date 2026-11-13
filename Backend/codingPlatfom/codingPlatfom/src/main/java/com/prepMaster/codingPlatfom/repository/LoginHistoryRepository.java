package com.prepMaster.codingPlatfom.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.LoginHistory;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
	List<LoginHistory> findTop50ByUserIdOrderByOccurredAtDesc(Long userId);
}

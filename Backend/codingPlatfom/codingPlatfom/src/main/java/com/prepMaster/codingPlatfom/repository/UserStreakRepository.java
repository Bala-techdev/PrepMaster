package com.prepMaster.codingPlatfom.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.UserStreak;

public interface UserStreakRepository extends JpaRepository<UserStreak, Long> {

	Optional<UserStreak> findByUserId(Long userId);
}

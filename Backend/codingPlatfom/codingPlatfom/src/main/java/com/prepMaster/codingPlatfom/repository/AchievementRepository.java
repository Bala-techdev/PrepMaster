package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.Achievement;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {

	List<Achievement> findByActiveTrueOrderByIdAsc();

	Optional<Achievement> findByCode(String code);
}

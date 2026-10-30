package com.prepMaster.codingPlatfom.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.UserSettings;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

	Optional<UserSettings> findByUserId(Long userId);
}

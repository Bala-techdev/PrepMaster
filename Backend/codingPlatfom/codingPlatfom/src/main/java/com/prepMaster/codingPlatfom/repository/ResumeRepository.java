package com.prepMaster.codingPlatfom.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.Resume;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
	Optional<Resume> findByUserIdAndSha256Hash(Long userId, String sha256Hash);
}

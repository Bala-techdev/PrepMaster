package com.prepMaster.codingPlatfom.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.CommunityComment;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {

	Page<CommunityComment> findByPostIdOrderByCreatedAtAsc(Long postId, Pageable pageable);

	List<CommunityComment> findByPostIdOrderByCreatedAtAsc(Long postId);

	long countByPostId(Long postId);

	List<CommunityComment> findTop10ByOrderByCreatedAtDesc();
}

package com.prepMaster.codingPlatfom.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prepMaster.codingPlatfom.entity.CommunityPost;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

	@Query("select p from CommunityPost p where (:topic is null or p.topic = :topic) " +
			"and (:search is null or lower(p.title) like lower(concat('%', :search, '%')) " +
			"or lower(p.body) like lower(concat('%', :search, '%')))")
	Page<CommunityPost> search(@Param("topic") String topic, @Param("search") String search, Pageable pageable);

	@Query("select p from CommunityPost p where (:topic is null or p.topic = :topic) " +
			"and (:search is null or lower(p.title) like lower(concat('%', :search, '%')) " +
			"or lower(p.body) like lower(concat('%', :search, '%')))")
	List<CommunityPost> searchAll(@Param("topic") String topic, @Param("search") String search);

	List<CommunityPost> findTop10ByOrderByCreatedAtDesc();
}

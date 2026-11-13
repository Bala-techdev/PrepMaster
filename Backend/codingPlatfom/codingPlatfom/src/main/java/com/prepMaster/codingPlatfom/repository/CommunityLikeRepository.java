package com.prepMaster.codingPlatfom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prepMaster.codingPlatfom.entity.CommunityLike;
import com.prepMaster.codingPlatfom.entity.CommunityLikeId;

public interface CommunityLikeRepository extends JpaRepository<CommunityLike, CommunityLikeId> {

	@Query("select count(l) > 0 from CommunityLike l where l.post.id = :postId and l.user.id = :userId")
	boolean existsByPostAndUser(@Param("postId") Long postId, @Param("userId") Long userId);

	@Query("select count(l) from CommunityLike l where l.post.id = :postId")
	long countForPost(@Param("postId") Long postId);

	@Modifying
	@Query("delete from CommunityLike l where l.post.id = :postId and l.user.id = :userId")
	void deleteByPostAndUser(@Param("postId") Long postId, @Param("userId") Long userId);

	long countByUserId(Long userId);
}

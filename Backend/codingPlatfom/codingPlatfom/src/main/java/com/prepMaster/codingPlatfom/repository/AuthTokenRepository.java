package com.prepMaster.codingPlatfom.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prepMaster.codingPlatfom.entity.AuthToken;
import com.prepMaster.codingPlatfom.entity.enums.AuthTokenType;

public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {
	Optional<AuthToken> findByTokenHashAndTokenType(String tokenHash, AuthTokenType tokenType);
	List<AuthToken> findByUserIdAndTokenTypeAndRevokedAtIsNull(Long userId, AuthTokenType tokenType);
}

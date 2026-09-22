package com.lumiere.user.repository;

import com.lumiere.user.model.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByUserId(String userId);

    void deleteByTokenHash(String tokenHash);

    void deleteByUserId(String userId);
}

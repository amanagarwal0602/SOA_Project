package com.lumiere.user.repository;

import com.lumiere.user.model.PasswordReset;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PasswordResetRepository extends MongoRepository<PasswordReset, String> {

    Optional<PasswordReset> findByTokenHashAndUsedFalse(String tokenHash);

    void deleteByUserId(String userId);
}

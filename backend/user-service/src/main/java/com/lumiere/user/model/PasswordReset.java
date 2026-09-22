package com.lumiere.user.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * One-time password-reset token.
 * Token value is SHA-256 hashed before storage.
 * TTL index: document auto-deleted 15 minutes after creation.
 * 'used' flag prevents replay within the TTL window.
 */
@Document(collection = "password_resets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordReset {

    @Id
    private String id;

    @Indexed
    private String userId;

    /** SHA-256 hex of the raw reset token. */
    private String tokenHash;

    @Builder.Default
    private boolean used = false;

    /** MongoDB TTL — auto-deletes 15 min after creation. */
    @Indexed(expireAfterSeconds = 0)
    private LocalDateTime expiresAt;

    @CreatedDate
    private LocalDateTime createdAt;
}

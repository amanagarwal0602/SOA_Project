package com.lumiere.user.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Hashed refresh token stored in MongoDB.
 * The actual token lives only in the httpOnly cookie — we only store its SHA-256 hash.
 * TTL index on expiresAt: MongoDB automatically deletes expired records.
 */
@Document(collection = "refresh_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    private String id;

    @Indexed
    private String userId;

    /** SHA-256 hex digest of the raw token value from the httpOnly cookie. */
    private String tokenHash;

    /** MongoDB TTL index — document is auto-deleted at this time. */
    @Indexed(expireAfterSeconds = 0)
    private LocalDateTime expiresAt;

    private String ipAddress;
    private String userAgent;

    @CreatedDate
    private LocalDateTime createdAt;
}

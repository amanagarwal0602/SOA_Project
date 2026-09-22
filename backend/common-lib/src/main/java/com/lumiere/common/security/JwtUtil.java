package com.lumiere.common.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * Stateless JWT utility — plain Java, no Spring dependencies.
 * Instantiate as a Spring @Bean in each service's @Configuration.
 *
 * Algorithm: HS512 (requires secret >= 64 ASCII characters / 512 bits).
 * Access token : 15 min   (configurable)
 * Refresh token: 7 days   (configurable)
 *
 * Claims layout:
 *   sub          → userId (MongoDB ObjectId string)
 *   email        → user email
 *   role         → admin | staff | customer
 *   permissions  → List<String>
 *   jti          → UUID (unique token ID — used for revocation)
 *   iat / exp    → standard
 */
@Slf4j
public class JwtUtil {

    /** Default 15-minute access token window. */
    public static final long DEFAULT_ACCESS_TOKEN_EXPIRY_MS  = 15L * 60 * 1_000;
    /** Default 7-day refresh token window. */
    public static final long DEFAULT_REFRESH_TOKEN_EXPIRY_MS = 7L * 24 * 60 * 60 * 1_000;

    private final SecretKey signingKey;
    private final long      accessTokenExpiryMs;
    private final long      refreshTokenExpiryMs;

    public JwtUtil(String secret, long accessTokenExpiryMs, long refreshTokenExpiryMs) {
        if (secret == null || secret.length() < 64) {
            throw new IllegalArgumentException(
                "JWT_SECRET must be at least 64 characters for HS512. " +
                "Current length: " + (secret == null ? 0 : secret.length()));
        }
        this.signingKey           = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiryMs  = accessTokenExpiryMs;
        this.refreshTokenExpiryMs = refreshTokenExpiryMs;
    }

    // ── Token generation ──────────────────────────────────────────────────────

    public String generateAccessToken(String userId, String email,
                                      String role, List<String> permissions) {
        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("role", role)
                .claim("permissions", permissions)
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiryMs))
                .signWith(signingKey, Jwts.SIG.HS512)
                .compact();
    }

    public String generateRefreshToken(String userId) {
        return Jwts.builder()
                .subject(userId)
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiryMs))
                .signWith(signingKey, Jwts.SIG.HS512)
                .compact();
    }

    // ── Token validation & claim extraction ───────────────────────────────────

    /**
     * Parse and verify the token. Throws JwtException on failure.
     */
    public Claims validateAndExtractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUserId(String token) {
        return validateAndExtractClaims(token).getSubject();
    }

    public String extractJti(String token) {
        return validateAndExtractClaims(token).getId();
    }

    public boolean isTokenValid(String token) {
        try {
            validateAndExtractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            return validateAndExtractClaims(token).getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}

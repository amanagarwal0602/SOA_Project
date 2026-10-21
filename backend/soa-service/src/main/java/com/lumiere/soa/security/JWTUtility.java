package com.lumiere.soa.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

/**
 * Skill 4: Token-Based Authentication for Banking/Security API
 * Skill 7: Securing Library / SOA Services with JWT
 * Uses JJWT to generate and validate HS256/HS384 signed tokens.
 */
@Component
public class JWTUtility {

    public static final String SECRET = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM1234567890";
    private static final SecretKey KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    private static final long EXPIRATION_TIME = 1000L * 60 * 60 * 24; // 24 hours

    public static String generateToken(String username) {
        return generateToken(username, "customer", null);
    }

    public static String generateToken(String username, String role) {
        return generateToken(username, role, null);
    }

    public static String generateToken(String username, String role, String userId) {
        var builder = Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(KEY);

        if (userId != null) {
            builder.claim("userId", userId);
        }

        return builder.compact();
    }

    public static boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(KEY)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static String getUsername(String token) {
        try {
            return getClaims(token).getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public static String getRole(String token) {
        try {
            Object role = getClaims(token).get("role");
            return role != null ? role.toString() : "customer";
        } catch (Exception e) {
            return "customer";
        }
    }

    public static Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public SecretKey getKey() {
        return KEY;
    }
}

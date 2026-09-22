package com.lumiere.user.service;

import com.lumiere.common.dto.ApiResponse;
import com.lumiere.common.exception.*;
import com.lumiere.common.security.JwtUtil;
import com.lumiere.common.security.Permissions;
import com.lumiere.user.dto.request.*;
import com.lumiere.user.dto.response.AuthResponse;
import com.lumiere.user.dto.response.UserResponse;
import com.lumiere.user.model.PasswordReset;
import com.lumiere.user.model.RefreshToken;
import com.lumiere.user.model.User;
import com.lumiere.user.repository.PasswordResetRepository;
import com.lumiere.user.repository.RefreshTokenRepository;
import com.lumiere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

/**
 * Authentication service — signup, login, refresh, logout, forgot/reset password.
 *
 * Login lockout: After 5 consecutive failed attempts, account is locked for 15 minutes.
 * Refresh token: SHA-256 hashed before storage; raw value goes in httpOnly cookie.
 * Password reset: token SHA-256 hashed, TTL 15 min, one-time use.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ── Signup ────────────────────────────────────────────────────────────────

    public AuthResponse signup(SignupRequest request) {
        // Check duplicates
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }
        if (request.getUsername() != null && !request.getUsername().isBlank()
                && userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
            throw new ConflictException("Username already taken");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .username(request.getUsername() != null && !request.getUsername().isBlank()
                        ? request.getUsername().trim() : null)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role("customer")
                .permissions(Permissions.CUSTOMER_PERMISSIONS)
                .active(true)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {} ({})", user.getEmail(), user.getId());

        String accessToken = jwtUtil.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole(), user.getPermissions());

        return AuthResponse.builder()
                .user(UserResponse.from(user))
                .token(accessToken)
                .build();
    }

    // ── Login ────────────────────────────────────────────────────────────────

    /**
     * Login by email OR username. The login request's `email` field accepts either.
     * Returns access token in body + raw refresh token (caller sets httpOnly cookie).
     */
    public LoginResult login(LoginRequest request, String ipAddress, String userAgent) {
        String identifier = request.getEmail().trim();

        User user = userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        // Check lockout
        if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(LocalDateTime.now())) {
            long minutesLeft = java.time.Duration.between(LocalDateTime.now(), user.getLockoutUntil()).toMinutes() + 1;
            throw new BadRequestException("Account locked. Try again in " + minutesLeft + " minute(s).");
        }

        // Check active
        if (!user.isActive()) {
            throw new UnauthorizedException("Account is deactivated. Contact support.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            handleFailedAttempt(user);
            throw new UnauthorizedException("Invalid credentials");
        }

        // Success — reset lockout state
        user.setLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        String accessToken = jwtUtil.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole(), user.getPermissions());

        String rawRefreshToken = jwtUtil.generateRefreshToken(user.getId());
        storeRefreshToken(user.getId(), rawRefreshToken, ipAddress, userAgent);

        log.info("User logged in: {} ({})", user.getEmail(), user.getId());

        return new LoginResult(
                AuthResponse.builder()
                        .user(UserResponse.from(user))
                        .token(accessToken)
                        .build(),
                rawRefreshToken
        );
    }

    // ── Refresh ──────────────────────────────────────────────────────────────

    /**
     * Rotate refresh token: validate old token, issue new access + refresh pair.
     * Old refresh token is deleted (single-use rotation).
     */
    public LoginResult refresh(String rawRefreshToken, String ipAddress, String userAgent) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is required");
        }

        // Validate JWT structure + signature + expiry
        if (!jwtUtil.isTokenValid(rawRefreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String tokenHash = sha256(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found — possible reuse"));

        // Delete old token (rotation)
        refreshTokenRepository.delete(stored);

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Account deactivated");
        }

        String newAccessToken = jwtUtil.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole(), user.getPermissions());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getId());
        storeRefreshToken(user.getId(), newRefreshToken, ipAddress, userAgent);

        return new LoginResult(
                AuthResponse.builder()
                        .user(UserResponse.from(user))
                        .token(newAccessToken)
                        .build(),
                newRefreshToken
        );
    }

    // ── Logout ───────────────────────────────────────────────────────────────

    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String tokenHash = sha256(rawRefreshToken);
            refreshTokenRepository.deleteByTokenHash(tokenHash);
        }
    }

    // ── Me ────────────────────────────────────────────────────────────────────

    public UserResponse me(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserResponse.from(user);
    }

    // ── Forgot password ──────────────────────────────────────────────────────

    /**
     * Generates a password reset token (UUID), stores SHA-256 hash, logs the token.
     * In production, this would send an email — for academic use, the token is logged.
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElse(null);

        // Always return success to prevent email enumeration
        if (user == null) {
            log.info("Password reset requested for non-existent email: {}", request.getEmail());
            return;
        }

        // Delete any existing reset tokens for this user
        passwordResetRepository.deleteByUserId(user.getId());

        String rawToken = UUID.randomUUID().toString();
        PasswordReset reset = PasswordReset.builder()
                .userId(user.getId())
                .tokenHash(sha256(rawToken))
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();
        passwordResetRepository.save(reset);

        // For academic/demo: log the token instead of emailing
        log.info("===== PASSWORD RESET TOKEN =====");
        log.info("Email: {}", user.getEmail());
        log.info("Token: {}", rawToken);
        log.info("Expires: {} (15 minutes)", reset.getExpiresAt());
        log.info("================================");
    }

    // ── Reset password ───────────────────────────────────────────────────────

    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = sha256(request.getToken());
        PasswordReset reset = passwordResetRepository.findByTokenHashAndUsedFalse(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (reset.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        User user = userRepository.findById(reset.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reset.getUserId()));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        reset.setUsed(true);
        passwordResetRepository.save(reset);

        // Invalidate all refresh tokens for this user (force re-login)
        refreshTokenRepository.deleteByUserId(user.getId());

        log.info("Password reset successful for user: {}", user.getEmail());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void handleFailedAttempt(User user) {
        user.setLoginAttempts(user.getLoginAttempts() + 1);
        if (user.getLoginAttempts() >= MAX_LOGIN_ATTEMPTS) {
            user.setLockoutUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
            log.warn("Account locked after {} failed attempts: {}", MAX_LOGIN_ATTEMPTS, user.getEmail());
        }
        userRepository.save(user);
    }

    private void storeRefreshToken(String userId, String rawToken, String ipAddress, String userAgent) {
        RefreshToken rt = RefreshToken.builder()
                .userId(userId)
                .tokenHash(sha256(rawToken))
                .expiresAt(LocalDateTime.now().plusDays(7))
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        refreshTokenRepository.save(rt);
    }

    static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    // ── Result record ────────────────────────────────────────────────────────

    /**
     * Wraps AuthResponse + raw refresh token for the controller to set in httpOnly cookie.
     */
    public record LoginResult(AuthResponse authResponse, String rawRefreshToken) {}
}

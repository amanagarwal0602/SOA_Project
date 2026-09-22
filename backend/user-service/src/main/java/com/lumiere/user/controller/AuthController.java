package com.lumiere.user.controller;

import com.lumiere.common.dto.ApiResponse;
import com.lumiere.user.dto.request.*;
import com.lumiere.user.dto.response.AuthResponse;
import com.lumiere.user.dto.response.UserResponse;
import com.lumiere.user.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Auth endpoints: signup, login, refresh, logout, me, forgot/reset password.
 *
 * Refresh token is sent as httpOnly cookie "refreshToken" (7 day, SameSite=Strict, Secure=false for dev).
 * Access token is returned in the response body for localStorage storage.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refreshToken";
    private static final int REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

    private final AuthService authService;

    // ── POST /api/auth/signup ────────────────────────────────────────────────

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse auth = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(auth, "Registration successful"));
    }

    // ── POST /api/auth/login ─────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String ip = httpRequest.getRemoteAddr();
        String ua = httpRequest.getHeader("User-Agent");
        AuthService.LoginResult result = authService.login(request, ip, ua);

        setRefreshCookie(httpResponse, result.rawRefreshToken());

        return ResponseEntity.ok(ApiResponse.success(result.authResponse(), "Login successful"));
    }

    // ── POST /api/auth/refresh ───────────────────────────────────────────────

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String ip = httpRequest.getRemoteAddr();
        String ua = httpRequest.getHeader("User-Agent");
        AuthService.LoginResult result = authService.refresh(refreshToken, ip, ua);

        setRefreshCookie(httpResponse, result.rawRefreshToken());

        return ResponseEntity.ok(ApiResponse.success(result.authResponse(), "Token refreshed"));
    }

    // ── POST /api/auth/logout ────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletResponse httpResponse) {

        authService.logout(refreshToken);
        clearRefreshCookie(httpResponse);

        return ResponseEntity.ok(ApiResponse.ok());
    }

    // ── GET /api/auth/me ─────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        UserResponse user = authService.me(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    // ── POST /api/auth/forgot-password ───────────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        // Always 200 to prevent email enumeration
        return ResponseEntity.ok(ApiResponse.success(null, "If an account with that email exists, a reset link has been sent."));
    }

    // ── POST /api/auth/reset-password ────────────────────────────────────────

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successful. Please log in."));
    }

    // ── Cookie helpers ───────────────────────────────────────────────────────

    private void setRefreshCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(REFRESH_COOKIE, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);  // false for dev; true in production
        cookie.setPath("/");
        cookie.setMaxAge(REFRESH_COOKIE_MAX_AGE);
        response.addCookie(cookie);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_COOKIE, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}

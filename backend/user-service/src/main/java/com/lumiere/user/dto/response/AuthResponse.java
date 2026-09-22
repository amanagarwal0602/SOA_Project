package com.lumiere.user.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Returned in the ApiResponse.data on successful login/signup/refresh.
 * Shape: { user: UserResponse, token: "eyJ..." }
 * The access token is in the body; the refresh token is set as an httpOnly cookie.
 */
@Data
@Builder
public class AuthResponse {
    private UserResponse user;
    /** JWT access token (15 min). Stored in localStorage by the client. */
    private String token;
}

package com.lumiere.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    /** Accepts either email address or username — both resolved server-side. */
    @NotBlank(message = "Email or username is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}

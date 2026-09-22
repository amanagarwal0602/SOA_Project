package com.lumiere.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Admin user/staff creation request. */
@Data
public class CreateUserRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    private String password;   // optional — defaults to "changeme123" if absent
    private String username;
    private String phone;
    private String role;       // admin | staff | chef | waiter | customer
    private String avatar;
    private AddressDto address;
}

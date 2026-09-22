package com.lumiere.user.dto.request;

import lombok.Data;

/** Admin user update — includes role which customer cannot self-change. */
@Data
public class UpdateUserRequest {
    private String name;
    private String phone;
    private String avatar;
    private AddressDto address;
    private String role;
}

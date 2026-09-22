package com.lumiere.user.dto.request;

import lombok.Data;

/** Profile self-update — fields the customer/staff can modify on themselves. */
@Data
public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String avatar;
    private AddressDto address;
}

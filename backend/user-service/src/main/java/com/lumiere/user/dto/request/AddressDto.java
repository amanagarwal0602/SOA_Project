package com.lumiere.user.dto.request;

import lombok.Data;

/**
 * Shared address shape for update requests.
 * Maps to User.Address embedded document.
 */
@Data
public class AddressDto {
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
}

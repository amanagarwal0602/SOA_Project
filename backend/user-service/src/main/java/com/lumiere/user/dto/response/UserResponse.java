package com.lumiere.user.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.lumiere.user.model.User;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Public user shape returned by all API responses.
 *
 * IMPORTANT: The frontend reads BOTH camelCase (user.id) and MongoDB-style (user._id)
 * interchangeably, and expects flat snake_case for address fields and boolean fields.
 * This DTO uses @JsonProperty to emit both "id" and "_id" with the same value,
 * and maps User.Address to flat address_* keys.
 *
 * Password hash is NEVER included here — all controllers use this DTO, never the raw User model.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {

    /** Serialised as "id" in the JSON body. */
    private String id;

    /** ALSO serialised as "_id" for frontend compatibility. */
    @JsonProperty("_id")
    private String mongoId;

    private String name;
    private String email;
    private String username;
    private String phone;
    private String role;
    private String avatar;

    // ── Flat snake_case address (matches frontend localStorage.js schema) ──────
    @JsonProperty("address_street")
    private String addressStreet;

    @JsonProperty("address_city")
    private String addressCity;

    @JsonProperty("address_state")
    private String addressState;

    @JsonProperty("address_zipcode")
    private String addressZipcode;

    @JsonProperty("address_country")
    private String addressCountry;

    // ── Collections ───────────────────────────────────────────────────────────
    @JsonProperty("favorite_items")
    private List<String> favoriteItems;

    private List<String> permissions;

    // ── Boolean flags (snake_case to match frontend) ──────────────────────────
    @JsonProperty("is_active")
    private boolean active;

    @JsonProperty("email_verified")
    private boolean emailVerified;

    // ── Timestamps (ISO-8601 strings) ─────────────────────────────────────────
    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    // ── Static factory ────────────────────────────────────────────────────────

    public static UserResponse from(User user) {
        User.Address addr = user.getAddress();
        return UserResponse.builder()
                .id(user.getId())
                .mongoId(user.getId())           // both "id" and "_id"
                .name(user.getName())
                .email(user.getEmail())
                .username(user.getUsername())
                .phone(user.getPhone())
                .role(user.getRole())
                .avatar(user.getAvatar())
                .addressStreet(addr  != null ? addr.getStreet()  : null)
                .addressCity(addr    != null ? addr.getCity()    : null)
                .addressState(addr   != null ? addr.getState()   : null)
                .addressZipcode(addr != null ? addr.getZipCode() : null)
                .addressCountry(addr != null ? addr.getCountry() : null)
                .favoriteItems(user.getFavoriteItems())
                .permissions(user.getPermissions())
                .active(user.isActive())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt()  != null ? user.getCreatedAt().toString()  : null)
                .updatedAt(user.getUpdatedAt()  != null ? user.getUpdatedAt().toString()  : null)
                .build();
    }
}

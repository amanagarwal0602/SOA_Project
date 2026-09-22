package com.lumiere.user.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * User document stored in MongoDB collection 'users' (database: lumiere_users).
 * Password is stored as BCrypt-12 hash — never serialised in responses (use UserResponse DTO).
 * Unique indexes: email (non-sparse), username (sparse — allows multiple null values).
 */
@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    /** Sparse: allows multiple documents with null username. */
    @Indexed(unique = true, sparse = true)
    private String username;

    /** BCrypt-12 hash — NEVER returned in any DTO/response. */
    private String passwordHash;

    private String phone;

    /** Roles: admin | staff | chef | waiter | customer */
    @Builder.Default
    private String role = "customer";

    private String avatar;

    @Builder.Default
    private Address address = new Address();

    @Builder.Default
    private List<String> favoriteItems = new ArrayList<>();

    /** Resolved permission strings — exact match with Permissions.java constants. */
    @Builder.Default
    private List<String> permissions = new ArrayList<>();

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean emailVerified = false;

    /** Failed login attempt counter — reset on successful login. */
    @Builder.Default
    private int loginAttempts = 0;

    /** Account locked until this time after 5 consecutive failures. */
    private LocalDateTime lockoutUntil;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // ── Embedded address ──────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }
}

package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Builder.Default
    @JsonProperty("table_type")
    private String tableType = "user";

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String username;

    private String password;

    private String phone;

    @Builder.Default
    private String role = "customer";

    private String avatar;

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

    @Column(length = 2000)
    @Builder.Default
    private String favoriteItems = "[]";

    @Column(length = 2000)
    @Builder.Default
    private String permissions = "[]";

    @JsonProperty("is_active")
    @Builder.Default
    private boolean isActive = true;

    @JsonProperty("email_verified")
    @Builder.Default
    private boolean emailVerified = true;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = "user_" + System.currentTimeMillis();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now().toString();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now().toString();
        }
    }

    @PreUpdate
    public void onPreUpdate() {
        updatedAt = LocalDateTime.now().toString();
    }

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id;
    }

    @JsonProperty("isActive")
    public boolean getIsActiveCamel() {
        return isActive;
    }

    @JsonProperty("isActive")
    public void setIsActiveCamel(boolean active) {
        this.isActive = active;
    }

    @JsonProperty("address")
    public Map<String, String> getAddressMap() {
        Map<String, String> map = new HashMap<>();
        map.put("street", addressStreet != null ? addressStreet : "");
        map.put("city", addressCity != null ? addressCity : "");
        map.put("state", addressState != null ? addressState : "");
        map.put("zipCode", addressZipcode != null ? addressZipcode : "");
        map.put("country", addressCountry != null ? addressCountry : "");
        return map;
    }

    @JsonProperty("permissions")
    public Object getParsedPermissions() {
        if (permissions == null || permissions.isBlank()) return Collections.emptyList();
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(permissions, Object.class);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @JsonProperty("permissions")
    public void setParsedPermissions(Object permObj) {
        if (permObj == null) {
            this.permissions = "[]";
            return;
        }
        if (permObj instanceof String) {
            this.permissions = (String) permObj;
            return;
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.permissions = mapper.writeValueAsString(permObj);
        } catch (Exception e) {
            this.permissions = "[]";
        }
    }

    @JsonProperty("favorite_items")
    public Object getParsedFavoriteItems() {
        if (favoriteItems == null || favoriteItems.isBlank()) return Collections.emptyList();
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(favoriteItems, Object.class);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @JsonProperty("favorite_items")
    public void setParsedFavoriteItems(Object favObj) {
        if (favObj == null) {
            this.favoriteItems = "[]";
            return;
        }
        if (favObj instanceof String) {
            this.favoriteItems = (String) favObj;
            return;
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.favoriteItems = mapper.writeValueAsString(favObj);
        } catch (Exception e) {
            this.favoriteItems = "[]";
        }
    }

    @JsonProperty("favoriteItems")
    public Object getFavoriteItemsCamel() {
        return getParsedFavoriteItems();
    }
}

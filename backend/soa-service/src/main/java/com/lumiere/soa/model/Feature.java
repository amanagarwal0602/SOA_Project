package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "features")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feature {

    @Id
    private String id;

    @Builder.Default
    @JsonProperty("table_type")
    private String tableType = "feature";

    private String icon;

    private String title;

    @Column(length = 2000)
    private String description;

    @JsonProperty("is_active")
    @Builder.Default
    private boolean isActive = true;

    @JsonProperty("display_order")
    @Builder.Default
    private int displayOrder = 1;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = "feature_" + System.currentTimeMillis();
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
}

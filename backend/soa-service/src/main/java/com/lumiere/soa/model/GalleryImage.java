package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "gallery")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GalleryImage {

    @Id
    private String id;

    @Builder.Default
    @JsonProperty("table_type")
    private String tableType = "gallery";

    @Column(length = 2000)
    private String url;

    private String title;

    @Column(length = 2000)
    private String description;

    @Builder.Default
    private String category = "general";

    @JsonProperty("is_featured")
    @Builder.Default
    private boolean isFeatured = false;

    @JsonProperty("created_at")
    private String createdAt;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = "gallery_" + System.currentTimeMillis();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now().toString();
        }
    }

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id;
    }

    @JsonProperty("image")
    public String getImage() {
        return url;
    }

    @JsonProperty("image")
    public void setImage(String image) {
        if (image != null && !image.isBlank()) {
            this.url = image;
        }
    }

    @JsonProperty("url")
    public String getUrl() {
        return url;
    }

    @JsonProperty("url")
    public void setUrl(String url) {
        if (url != null && !url.isBlank()) {
            this.url = url;
        }
    }

    @JsonProperty("isPublished")
    public boolean getIsPublished() {
        return isFeatured;
    }

    @JsonProperty("isPublished")
    public void setIsPublished(boolean isPublished) {
        this.isFeatured = isPublished;
    }
}

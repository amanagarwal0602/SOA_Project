package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {

    @Id
    private String id;

    @Builder.Default
    @JsonProperty("table_type")
    private String tableType = "team";

    private String name;

    private String role;

    @Column(length = 2000)
    private String bio;

    @Column(length = 2000)
    private String image;

    @JsonProperty("social_twitter")
    private String socialTwitter;

    @JsonProperty("social_facebook")
    private String socialFacebook;

    @JsonProperty("social_instagram")
    private String socialInstagram;

    @JsonProperty("social_linkedin")
    private String socialLinkedin;

    @JsonProperty("show_on_about")
    @Builder.Default
    private boolean showOnAbout = true;

    @JsonProperty("is_active")
    @Builder.Default
    private boolean isActive = true;

    @JsonProperty("display_order")
    @Builder.Default
    private int displayOrder = 1;

    @JsonProperty("created_at")
    private String createdAt;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = "team_" + System.currentTimeMillis();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now().toString();
        }
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
    public void setIsActiveCamel(boolean isActive) {
        this.isActive = isActive;
    }

    @JsonProperty("showInAbout")
    public boolean getShowInAbout() {
        return showOnAbout;
    }

    @JsonProperty("showInAbout")
    public void setShowInAbout(boolean showInAbout) {
        this.showOnAbout = showInAbout;
    }

    @JsonProperty("showOnAbout")
    public boolean getShowOnAbout() {
        return showOnAbout;
    }

    public boolean isShowOnAbout() {
        return showOnAbout;
    }
}

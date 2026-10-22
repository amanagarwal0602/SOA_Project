package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    private String id;

    @Builder.Default
    @JsonProperty("table_type")
    private String tableType = "review";

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("user_name")
    private String userName;

    @JsonProperty("user_avatar")
    private String userAvatar;

    @JsonProperty("menu_item_id")
    private String menuItemId;

    @JsonProperty("order_id")
    private String orderId;

    private String title;

    @Builder.Default
    private int rating = 5;

    @Column(length = 2000)
    private String comment;

    private String date;

    @JsonProperty("is_published")
    @Builder.Default
    private boolean isPublished = true;

    @JsonProperty("show_on_homepage")
    @Builder.Default
    private boolean showOnHomepage = true;

    @Column(length = 2000)
    private String response;

    @JsonProperty("created_at")
    private String createdAt;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = "review_" + System.currentTimeMillis();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now().toString();
        }
        if (date == null) {
            date = LocalDateTime.now().toLocalDate().toString();
        }
    }

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id;
    }

    @JsonProperty("review")
    public String getReviewAlias() {
        return comment;
    }

    @JsonProperty("menuItem")
    public String getMenuItemAlias() {
        return menuItemId;
    }

    @JsonProperty("menuItem")
    public void setMenuItemAlias(String menuItem) {
        this.menuItemId = menuItem;
    }

    @JsonProperty("order")
    public String getOrderAlias() {
        return orderId;
    }

    @JsonProperty("order")
    public void setOrderAlias(String order) {
        this.orderId = order;
    }

    @JsonProperty("userId")
    public String getUserIdCamel() {
        return userId;
    }

    @JsonProperty("userName")
    public String getUserNameCamel() {
        return userName;
    }

    @JsonProperty("createdAt")
    public String getCreatedAtAlias() {
        return createdAt;
    }

    @JsonProperty("createdAt")
    public void setCreatedAtAlias(String val) {
        if (this.createdAt == null) {
            this.createdAt = val;
        }
    }

    @JsonProperty("isPublished")
    public boolean getIsPublishedCamel() {
        return isPublished;
    }

    @JsonProperty("isPublished")
    public void setIsPublishedCamel(boolean pub) {
        this.isPublished = pub;
    }

    @JsonProperty("showOnHomepage")
    public boolean getShowOnHomepageCamel() {
        return showOnHomepage;
    }

    @JsonProperty("showOnHomepage")
    public void setShowOnHomepageCamel(boolean show) {
        this.showOnHomepage = show;
    }

    @JsonProperty("adminResponse")
    public Map<String, Object> getAdminResponseMap() {
        if (response == null || response.isBlank()) return null;
        Map<String, Object> map = new HashMap<>();
        map.put("response", response);
        map.put("respondedAt", createdAt != null ? createdAt : LocalDateTime.now().toString());
        map.put("respondedBy", Map.of("name", "Management"));
        return map;
    }

    @JsonProperty("user")
    public Map<String, Object> getUserMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("name", userName != null ? userName : "Customer");
        map.put("avatar", userAvatar);
        return map;
    }
}

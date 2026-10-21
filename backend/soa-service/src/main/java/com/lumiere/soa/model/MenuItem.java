package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Skill 1: Designing a Food Delivery SOA System — Menu Catalog Item
 */
@Entity
@Table(name = "menu_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {

    @Id
    private String id;

    @Builder.Default
    @JsonProperty("table_type")
    private String tableType = "menu";

    private String name;

    @Column(length = 2000)
    private String description;

    private double price;

    private String category;

    @Column(length = 2000)
    private String image;

    @JsonProperty("is_available")
    @Builder.Default
    private boolean isAvailable = true;

    @JsonProperty("is_veg")
    @Builder.Default
    private boolean isVeg = true;

    @JsonProperty("spicy_level")
    @Builder.Default
    private int spicyLevel = 1;

    @Column(length = 2000)
    @Builder.Default
    private String ingredients = "[]";

    @Column(length = 2000)
    @Builder.Default
    private String allergens = "[]";

    @JsonProperty("nutrition_calories")
    @Builder.Default
    private int nutritionCalories = 350;

    @JsonProperty("nutrition_protein")
    @Builder.Default
    private int nutritionProtein = 12;

    @JsonProperty("nutrition_carbs")
    @Builder.Default
    private int nutritionCarbs = 40;

    @JsonProperty("nutrition_fat")
    @Builder.Default
    private int nutritionFat = 10;

    @JsonProperty("prep_time")
    @Builder.Default
    private int prepTime = 20;

    @Builder.Default
    private double rating = 4.5;

    @JsonProperty("rating_count")
    @Builder.Default
    private int ratingCount = 25;

    @JsonProperty("order_count")
    @Builder.Default
    private int orderCount = 50;

    @JsonProperty("show_on_homepage")
    @Builder.Default
    private boolean showOnHomepage = true;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = "menu_" + System.currentTimeMillis();
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

package com.lumiere.menu.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.lumiere.menu.model.MenuItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Public menu item response shape — mirrors frontend expectations.
 * Emits both "id" and "_id" for frontend compatibility.
 */
@Data
@Builder
public class MenuItemResponse {

    private String id;

    @JsonProperty("_id")
    private String mongoId;

    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private String image;

    @JsonProperty("isAvailable")
    private boolean available;

    @JsonProperty("isVeg")
    private boolean veg;

    private int spicyLevel;
    private List<String> ingredients;
    private List<String> allergens;
    private MenuItem.Nutrition nutrition;
    private int prepTime;
    private double rating;
    private int ratingCount;
    private int orderCount;
    private Integer stockQty;
    private boolean showOnHomepage;
    private String prepStation;
    private List<String> dietaryTags;
    private String createdAt;
    private String updatedAt;

    public static MenuItemResponse from(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .mongoId(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .category(item.getCategory())
                .image(item.getImage())
                .available(item.isAvailable())
                .veg(item.isVeg())
                .spicyLevel(item.getSpicyLevel())
                .ingredients(item.getIngredients())
                .allergens(item.getAllergens())
                .nutrition(item.getNutrition())
                .prepTime(item.getPrepTime())
                .rating(item.getRating())
                .ratingCount(item.getRatingCount())
                .orderCount(item.getOrderCount())
                .stockQty(item.getStockQty())
                .showOnHomepage(item.isShowOnHomepage())
                .prepStation(item.getPrepStation())
                .dietaryTags(item.getDietaryTags())
                .createdAt(item.getCreatedAt() != null ? item.getCreatedAt().toString() : null)
                .updatedAt(item.getUpdatedAt() != null ? item.getUpdatedAt().toString() : null)
                .build();
    }
}

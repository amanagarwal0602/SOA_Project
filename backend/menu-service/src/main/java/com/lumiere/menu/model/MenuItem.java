package com.lumiere.menu.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Menu item document — collection 'menu_items' (database: lumiere_menu).
 */
@Document(collection = "menu_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {

    @Id
    private String id;

    private String name;
    private String description;
    private BigDecimal price;

    @Indexed
    private String category;

    private String image;

    @Builder.Default
    private boolean available = true;

    @Builder.Default
    private boolean veg = false;

    @Builder.Default
    private int spicyLevel = 0;

    @Builder.Default
    private List<String> ingredients = new ArrayList<>();

    @Builder.Default
    private List<String> allergens = new ArrayList<>();

    @Builder.Default
    private Nutrition nutrition = new Nutrition();

    @Builder.Default
    private int prepTime = 0;

    @Builder.Default
    private double rating = 0.0;

    @Builder.Default
    private int ratingCount = 0;

    @Builder.Default
    private int orderCount = 0;

    private Integer stockQty;  // null = unlimited

    @Builder.Default
    private boolean showOnHomepage = false;

    @Builder.Default
    private String prepStation = "general";

    @Builder.Default
    private List<String> dietaryTags = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Nutrition {
        @Builder.Default private int calories = 0;
        @Builder.Default private int protein = 0;
        @Builder.Default private int carbs = 0;
        @Builder.Default private int fat = 0;
    }
}

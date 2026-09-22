package com.lumiere.menu.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateMenuItemRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private String image;
    private Boolean veg;
    private Integer spicyLevel;
    private List<String> ingredients;
    private List<String> allergens;
    private NutritionDto nutrition;
    private Integer prepTime;
    private Integer stockQty;
    private Boolean showOnHomepage;
    private String prepStation;
    private List<String> dietaryTags;
}

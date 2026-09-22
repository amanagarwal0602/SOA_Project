package com.lumiere.menu.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TodaysOfferRequest {
    private String menuItemId;
    private String title;
    private String description;
    private String image;
    private BigDecimal originalPrice;
    private BigDecimal offerPrice;
    private int discountPercent;
    private String startDate;  // ISO date string
    private String endDate;    // ISO date string
}

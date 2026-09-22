package com.lumiere.menu.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Today's offer — collection 'todays_offers'.
 * An offer references a menu item and can override its price for a limited period.
 */
@Document(collection = "todays_offers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodaysOffer {

    @Id
    private String id;

    private String menuItemId;
    private String title;
    private String description;
    private String image;
    private BigDecimal originalPrice;
    private BigDecimal offerPrice;
    private int discountPercent;

    @Builder.Default
    private boolean active = true;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

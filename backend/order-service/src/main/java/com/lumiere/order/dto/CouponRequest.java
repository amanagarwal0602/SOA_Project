package com.lumiere.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank
    private String code;
    private String description;
    private String discountType;    // percentage | fixed
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscount;
    private int usageLimit;
    private String expiresAt;       // ISO datetime
}

package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    private String id;

    @Builder.Default
    @JsonProperty("table_type")
    private String tableType = "coupon";

    @Column(unique = true, nullable = false)
    private String code;

    private String description;

    @JsonProperty("discount_type")
    @Builder.Default
    private String discountType = "percentage";

    @JsonProperty("discount_value")
    @Builder.Default
    private double discountValue = 10.0;

    @JsonProperty("min_order_value")
    @Builder.Default
    private double minOrderValue = 0.0;

    @JsonProperty("max_discount")
    @Builder.Default
    private double maxDiscount = 100.0;

    @JsonProperty("valid_from")
    private String validFrom;

    @JsonProperty("valid_until")
    private String validUntil;

    @JsonProperty("is_active")
    @Builder.Default
    private boolean isActive = true;

    @JsonProperty("created_at")
    private String createdAt;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = "coupon_" + System.currentTimeMillis();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now().toString();
        }
    }

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id;
    }

    @JsonProperty("discountType")
    public String getDiscountTypeCamel() {
        return discountType;
    }

    @JsonProperty("discountType")
    public void setDiscountTypeCamel(String discountType) {
        this.discountType = discountType;
    }

    @JsonProperty("discountValue")
    public double getDiscountValueCamel() {
        return discountValue;
    }

    @JsonProperty("discountValue")
    public void setDiscountValueCamel(double discountValue) {
        this.discountValue = discountValue;
    }

    @JsonProperty("minOrderAmount")
    public double getMinOrderAmount() {
        return minOrderValue;
    }

    @JsonProperty("minOrderAmount")
    public void setMinOrderAmount(double minOrderAmount) {
        this.minOrderValue = minOrderAmount;
    }

    @JsonProperty("maxDiscountAmount")
    public double getMaxDiscountAmount() {
        return maxDiscount;
    }

    @JsonProperty("maxDiscountAmount")
    public void setMaxDiscountAmount(double maxDiscountAmount) {
        this.maxDiscount = maxDiscountAmount;
    }

    @JsonProperty("isActive")
    public boolean getIsActiveCamel() {
        return isActive;
    }

    @JsonProperty("isActive")
    public void setIsActiveCamel(boolean isActive) {
        this.isActive = isActive;
    }

    @JsonProperty("validFrom")
    public String getValidFromCamel() {
        return validFrom;
    }

    @JsonProperty("validFrom")
    public void setValidFromCamel(String validFrom) {
        this.validFrom = validFrom;
    }

    @JsonProperty("validUntil")
    public String getValidUntilCamel() {
        return validUntil;
    }

    @JsonProperty("validUntil")
    public void setValidUntilCamel(String validUntil) {
        this.validUntil = validUntil;
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
}

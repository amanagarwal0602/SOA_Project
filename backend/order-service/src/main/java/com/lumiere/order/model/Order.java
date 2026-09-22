package com.lumiere.order.model;

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

@Document(collection = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    private String idempotencyKey;

    private int dailyOrderNumber;

    @Indexed
    private String userId;
    private String userName;
    private String userEmail;
    private String userPhone;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal deliveryFee;
    private BigDecimal discount;
    private String couponCode;
    private BigDecimal total;

    @Builder.Default
    private String status = "pending";

    @Builder.Default
    private List<StatusChange> statusHistory = new ArrayList<>();

    private String paymentMethod;

    @Builder.Default
    private String paymentStatus = "pending";

    @Builder.Default
    private String deliveryType = "dine-in";

    private DeliveryAddress deliveryAddress;
    private String specialInstructions;

    @Builder.Default
    private boolean hasReservation = false;
    private String reservationDate;
    private String reservationTime;
    private Integer numberOfGuests;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String menuItemId;
        private String name;
        private BigDecimal price;
        private int quantity;
        private String prepStation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusChange {
        private String from;
        private String to;
        private String changedBy;
        private LocalDateTime changedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryAddress {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }
}

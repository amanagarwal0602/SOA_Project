package com.lumiere.order.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequest {
    private List<OrderItemDto> items;
    private String couponCode;
    private String paymentMethod;
    private String deliveryType;      // dine-in | takeaway | delivery
    private DeliveryAddressDto deliveryAddress;
    private String specialInstructions;
    private String idempotencyKey;
    // Reservation fields
    private boolean hasReservation;
    private String reservationDate;
    private String reservationTime;
    private Integer numberOfGuests;

    @Data
    public static class OrderItemDto {
        private String menuItemId;
        private String name;
        private BigDecimal price;
        private int quantity;
        private String prepStation;
    }

    @Data
    public static class DeliveryAddressDto {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }
}

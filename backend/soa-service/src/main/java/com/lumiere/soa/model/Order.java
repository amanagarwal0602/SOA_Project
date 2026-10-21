package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;

/**
 * Skill 1: Designing a Food Delivery SOA System — Order Processing
 */
@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    private String id;

    @Builder.Default
    @JsonProperty("table_type")
    private String tableType = "order";

    @JsonProperty("order_number")
    private String orderNumber;

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("user_name")
    private String userName;

    @JsonProperty("user_email")
    private String userEmail;

    @JsonProperty("user_phone")
    private String userPhone;

    @Column(length = 10000)
    private String items;

    @JsonProperty("total_price")
    private double totalPrice;

    @Column(length = 2000)
    @JsonProperty("delivery_address")
    private String deliveryAddress;

    @JsonProperty("payment_method")
    @Builder.Default
    private String paymentMethod = "card";

    @JsonProperty("payment_status")
    @Builder.Default
    private String paymentStatus = "paid";

    @Builder.Default
    private String status = "pending";

    @Column(length = 2000)
    @JsonProperty("special_instructions")
    private String specialInstructions;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = "order_" + System.currentTimeMillis();
        }
        if (orderNumber == null) {
            orderNumber = "ORD-" + (System.currentTimeMillis() % 1000000);
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

    @JsonProperty("orderId")
    public String getOrderId() {
        return id;
    }

    @JsonProperty("total")
    public double getTotal() {
        return totalPrice;
    }

    @JsonProperty("totalPrice")
    public double getTotalPriceAlias() {
        return totalPrice;
    }

    @JsonProperty("customerEmail")
    public String getCustomerEmail() {
        return userEmail;
    }

    @JsonProperty("customer_email")
    public String getCustomerEmailSnake() {
        return userEmail;
    }

    @JsonProperty("customerName")
    public String getCustomerName() {
        return userName;
    }

    @JsonProperty("customer_name")
    public String getCustomerNameSnake() {
        return userName;
    }

    @JsonProperty("customerPhone")
    public String getCustomerPhone() {
        return userPhone;
    }

    @JsonProperty("dailyOrderNumber")
    public String getDailyOrderNumber() {
        return orderNumber;
    }

    @JsonProperty("daily_order_number")
    public String getDailyOrderNumberSnake() {
        return orderNumber;
    }

    @JsonProperty("dailyBillNumber")
    public String getDailyBillNumber() {
        return orderNumber;
    }

    @JsonProperty("items")
    public Object getParsedItems() {
        if (items == null || items.isBlank()) {
            return Collections.emptyList();
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(items, Object.class);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @JsonProperty("items")
    public void setParsedItems(Object itemsObj) {
        if (itemsObj == null) {
            this.items = "[]";
            return;
        }
        if (itemsObj instanceof String) {
            this.items = (String) itemsObj;
            return;
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.items = mapper.writeValueAsString(itemsObj);
        } catch (Exception e) {
            this.items = "[]";
        }
    }
}

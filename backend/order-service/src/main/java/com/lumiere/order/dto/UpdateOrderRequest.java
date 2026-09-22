package com.lumiere.order.dto;

import lombok.Data;

@Data
public class UpdateOrderRequest {
    private String status;
    private String paymentStatus;
}

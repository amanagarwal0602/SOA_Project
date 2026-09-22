package com.lumiere.menu.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/** Internal stock reservation request/response for order-service. */
@Data
@Builder
public class StockReservation {
    private String menuItemId;
    private int qty;
    private boolean success;
    private Integer available; // current stock if reservation failed
}

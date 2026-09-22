package com.lumiere.order.client;

import lombok.Builder;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Feign client for menu-service internal API.
 * Circuit breaker "menu-service" configured in application.yml.
 */
@FeignClient(name = "menu-service", path = "/internal/menu")
public interface MenuServiceClient {

    @PostMapping("/reserve")
    List<StockReservationDto> reserveStock(@RequestBody List<StockReservationDto> reservations);

    @PostMapping("/release")
    void releaseStock(@RequestBody List<StockReservationDto> reservations);

    @Data
    @Builder
    class StockReservationDto {
        private String menuItemId;
        private int qty;
        private boolean success;
        private Integer available;
    }
}

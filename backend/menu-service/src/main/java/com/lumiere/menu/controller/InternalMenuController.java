package com.lumiere.menu.controller;

import com.lumiere.menu.dto.MenuItemResponse;
import com.lumiere.menu.dto.StockReservation;
import com.lumiere.menu.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Internal endpoints — NOT exposed through the API gateway.
 * Called by order-service via Feign/RestTemplate for stock management and batch lookups.
 */
@RestController
@RequestMapping("/internal/menu")
@RequiredArgsConstructor
public class InternalMenuController {

    private final MenuService menuService;

    /** Batch fetch menu items by IDs — used by order-service to get item details at checkout. */
    @GetMapping("/items")
    public ResponseEntity<List<MenuItemResponse>> getItemsByIds(
            @RequestParam List<String> ids) {
        return ResponseEntity.ok(menuService.getMenuItemsByIds(ids));
    }

    /** Reserve stock for order — decrements stockQty atomically. */
    @PostMapping("/reserve")
    public ResponseEntity<List<StockReservation>> reserveStock(
            @RequestBody List<StockReservation> reservations) {
        return ResponseEntity.ok(menuService.reserveStock(reservations));
    }

    /** Release stock — rolls back a failed reservation. */
    @PostMapping("/release")
    public ResponseEntity<Void> releaseStock(
            @RequestBody List<StockReservation> reservations) {
        menuService.releaseStock(reservations);
        return ResponseEntity.ok().build();
    }
}

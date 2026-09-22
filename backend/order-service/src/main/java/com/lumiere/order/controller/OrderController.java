package com.lumiere.order.controller;

import com.lumiere.common.dto.ApiResponse;
import com.lumiere.order.dto.*;
import com.lumiere.order.model.Order;
import com.lumiere.order.model.KitchenTicket;
import com.lumiere.order.service.OrderService;
import com.lumiere.order.service.SseEmitterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final SseEmitterRegistry sseEmitterRegistry;

    // ── POST /api/orders (checkout) ──────────────────────────────────────────

    @PostMapping("/api/orders")
    public ResponseEntity<ApiResponse<Order>> createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication auth) {
        String userId = (String) auth.getPrincipal();
        // Extract user info from auth or request headers
        Order order = orderService.checkout(request, userId,
                null, null, null); // name/email/phone come from gateway headers or are in auth claims
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(order, "Order placed successfully"));
    }

    // ── GET /api/orders ──────────────────────────────────────────────────────

    @GetMapping("/api/orders")
    public ResponseEntity<ApiResponse<List<Order>>> getOrders(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("view_orders") || a.equals("ROLE_ADMIN"));

        List<Order> orders = isAdmin ? orderService.getAllOrders() : orderService.getOrdersByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    // ── GET /api/orders/{id} ─────────────────────────────────────────────────

    @GetMapping("/api/orders/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrder(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    // ── PUT /api/orders/{id} ─────────────────────────────────────────────────

    @PutMapping("/api/orders/{id}")
    @PreAuthorize("hasAuthority('edit_orders')")
    public ResponseEntity<ApiResponse<Order>> updateOrder(
            @PathVariable String id,
            @RequestBody UpdateOrderRequest request,
            Authentication auth) {
        String changedBy = (String) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(
                orderService.updateOrder(id, request, changedBy), "Order updated"));
    }

    // ── PUT /api/orders/{id}/status ──────────────────────────────────────────

    @PutMapping("/api/orders/{id}/status")
    @PreAuthorize("hasAuthority('edit_orders')")
    public ResponseEntity<ApiResponse<Order>> updateStatus(
            @PathVariable String id,
            @RequestBody UpdateOrderRequest request,
            Authentication auth) {
        String changedBy = (String) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(
                orderService.updateStatus(id, request.getStatus(), changedBy), "Status updated"));
    }

    // ── GET /api/orders/{id}/bill ────────────────────────────────────────────

    @GetMapping("/api/orders/{id}/bill")
    public ResponseEntity<ApiResponse<Order>> getBill(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getBill(id)));
    }

    // ── GET /api/orders/export ───────────────────────────────────────────────

    @GetMapping(value = "/api/orders/export", produces = "text/csv")
    @PreAuthorize("hasAuthority('export_csv')")
    public ResponseEntity<String> exportCsv() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders_export.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(orderService.exportCsv());
    }

    // ── GET /api/orders/stream (SSE) ─────────────────────────────────────────

    @GetMapping(value = "/api/orders/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter orderStream(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return sseEmitterRegistry.createOrderEmitter(userId);
    }

    // ── GET /api/orders/analytics/dashboard ──────────────────────────────────

    @GetMapping("/api/orders/analytics/dashboard")
    @PreAuthorize("hasAuthority('view_analytics')")
    public ResponseEntity<ApiResponse<DashboardAnalytics>> getDashboardAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getDashboardAnalytics()));
    }

    // ── Kitchen endpoints ────────────────────────────────────────────────────

    @GetMapping("/api/kitchen/tickets")
    @PreAuthorize("hasAnyAuthority('view_orders', 'edit_orders')")
    public ResponseEntity<ApiResponse<List<KitchenTicket>>> getKitchenTickets() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getKitchenTickets()));
    }

    @PatchMapping("/api/kitchen/tickets/{id}/status")
    @PreAuthorize("hasAuthority('edit_orders')")
    public ResponseEntity<ApiResponse<KitchenTicket>> updateTicketStatus(
            @PathVariable String id,
            @RequestBody UpdateOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.updateTicketStatus(id, request.getStatus()), "Ticket updated"));
    }

    @GetMapping(value = "/api/kitchen/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasAnyAuthority('view_orders', 'edit_orders')")
    public SseEmitter kitchenStream() {
        return sseEmitterRegistry.createKitchenEmitter();
    }
}

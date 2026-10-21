package com.lumiere.soa.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lumiere.soa.model.Order;
import com.lumiere.soa.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Skill 1: Designing a Food Delivery SOA System — Order Processing Service
 */
@RestController
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    public OrderController(OrderRepository orderRepository, ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping({"/api/orders", "/api/admin/orders"})
    public ResponseEntity<?> getOrders(@RequestParam(required = false) String userId) {
        List<Order> orders;
        if (userId != null && !userId.isBlank()) {
            orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(Map.of("data", orders));
    }

    @PostMapping({"/api/orders", "/orders"})
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> orderData) {
        String id = "order_" + System.currentTimeMillis();
        String orderNumber = "ORD-" + (System.currentTimeMillis() % 1000000);

        Object itemsObj = orderData.get("items");
        String itemsJson = "[]";
        try {
            if (itemsObj instanceof String) {
                itemsJson = (String) itemsObj;
            } else if (itemsObj != null) {
                itemsJson = objectMapper.writeValueAsString(itemsObj);
            }
        } catch (Exception e) {
            itemsJson = "[]";
        }

        double totalPrice = 0.0;
        if (orderData.get("total_price") != null) {
            totalPrice = Double.parseDouble(orderData.get("total_price").toString());
        } else if (orderData.get("totalPrice") != null) {
            totalPrice = Double.parseDouble(orderData.get("totalPrice").toString());
        } else if (orderData.get("total") != null) {
            totalPrice = Double.parseDouble(orderData.get("total").toString());
        } else if (orderData.get("amount") != null) {
            totalPrice = Double.parseDouble(orderData.get("amount").toString());
        }

        String userId = (String) (orderData.get("userId") != null ? orderData.get("userId") : orderData.get("user_id"));
        String userName = (String) (orderData.get("userName") != null ? orderData.get("userName") :
                (orderData.get("user_name") != null ? orderData.get("user_name") :
                (orderData.get("customerName") != null ? orderData.get("customerName") : orderData.get("name"))));
        String userEmail = (String) (orderData.get("userEmail") != null ? orderData.get("userEmail") :
                (orderData.get("user_email") != null ? orderData.get("user_email") :
                (orderData.get("customerEmail") != null ? orderData.get("customerEmail") : orderData.get("email"))));
        String userPhone = (String) (orderData.get("userPhone") != null ? orderData.get("userPhone") :
                (orderData.get("user_phone") != null ? orderData.get("user_phone") :
                (orderData.get("contactPhone") != null ? orderData.get("contactPhone") : orderData.get("phone"))));

        String deliveryAddress = (String) (orderData.get("delivery_address") != null ? orderData.get("delivery_address") : orderData.get("deliveryAddress"));

        String utrNumber = (String) (orderData.get("utrNumber") != null ? orderData.get("utrNumber") :
                (orderData.get("utr_number") != null ? orderData.get("utr_number") :
                (orderData.get("transactionId") != null ? orderData.get("transactionId") : orderData.get("transaction_id"))));

        Order order = Order.builder()
                .id(id)
                .orderNumber(orderNumber)
                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)
                .userPhone(userPhone)
                .items(itemsJson)
                .totalPrice(totalPrice)
                .deliveryAddress(deliveryAddress)
                .paymentMethod((String) (orderData.get("payment_method") != null ? orderData.get("payment_method") : orderData.getOrDefault("paymentMethod", "card")))
                .paymentStatus((String) (orderData.get("payment_status") != null ? orderData.get("payment_status") : orderData.getOrDefault("paymentStatus", "pending")))
                .utrNumber(utrNumber)
                .transactionId(utrNumber)
                .status((String) orderData.getOrDefault("status", "pending"))
                .specialInstructions((String) (orderData.get("special_instructions") != null ? orderData.get("special_instructions") : orderData.get("specialInstructions")))
                .build();

        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PutMapping({"/api/orders/{id}", "/api/orders/{id}/status", "/api/admin/orders/{id}/status"})
    public ResponseEntity<?> updateOrder(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        if (updates.containsKey("status")) {
            order.setStatus((String) updates.get("status"));
        }
        if (updates.containsKey("payment_status") || updates.containsKey("paymentStatus")) {
            order.setPaymentStatus((String) updates.getOrDefault("payment_status", updates.get("paymentStatus")));
        }
        if (updates.containsKey("utrNumber") || updates.containsKey("utr_number")) {
            String utr = (String) updates.getOrDefault("utrNumber", updates.get("utr_number"));
            order.setUtrNumber(utr);
            order.setTransactionId(utr);
        }

        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PutMapping({"/api/orders/{id}/verify-payment", "/api/admin/orders/{id}/verify-payment"})
    public ResponseEntity<?> verifyPayment(@PathVariable String id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        order.setPaymentStatus("paid");
        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(Map.of("data", saved, "success", true));
    }

    @PutMapping("/api/orders/{id}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable String id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        order.setStatus("completed");
        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @DeleteMapping("/api/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable String id) {
        orderRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("data", Map.of("id", id, "deleted", true)));
    }
}

package com.lumiere.order.service;

import com.lumiere.common.exception.*;
import com.lumiere.order.client.MenuServiceClient;
import com.lumiere.order.dto.*;
import com.lumiere.order.model.*;
import com.lumiere.order.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Order service — checkout saga, status management, analytics.
 *
 * Checkout flow:
 * 1. Idempotency check
 * 2. Coupon validation (if provided)
 * 3. Stock reservation via menu-service Feign
 * 4. Order creation + kitchen ticket fan-out
 * 5. SSE push
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.08"); // 8%
    private static final BigDecimal DELIVERY_FEE = new BigDecimal("3.99");

    private final OrderRepository orderRepository;
    private final KitchenTicketRepository kitchenTicketRepository;
    private final CouponRepository couponRepository;
    private final MenuServiceClient menuServiceClient;
    private final BillCounterService billCounterService;
    private final SseEmitterRegistry sseEmitterRegistry;

    // ── Checkout saga ────────────────────────────────────────────────────────

    public Order checkout(CreateOrderRequest request, String userId, String userName,
                          String userEmail, String userPhone) {
        // 1. Idempotency
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            Optional<Order> existing = orderRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                log.info("Idempotent order returned: {}", existing.get().getId());
                return existing.get();
            }
        }

        // 2. Coupon validation
        BigDecimal discount = BigDecimal.ZERO;
        String appliedCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Coupon coupon = validateAndApplyCoupon(request.getCouponCode(),
                    calculateSubtotal(request.getItems()));
            discount = calculateDiscount(coupon, calculateSubtotal(request.getItems()));
            appliedCoupon = coupon.getCode();
        }

        // 3. Stock reservation
        try {
            List<MenuServiceClient.StockReservationDto> stockReqs = request.getItems().stream()
                    .map(item -> MenuServiceClient.StockReservationDto.builder()
                            .menuItemId(item.getMenuItemId())
                            .qty(item.getQuantity())
                            .build())
                    .collect(Collectors.toList());

            List<MenuServiceClient.StockReservationDto> results = menuServiceClient.reserveStock(stockReqs);

            List<MenuServiceClient.StockReservationDto> failures = results.stream()
                    .filter(r -> !r.isSuccess())
                    .collect(Collectors.toList());

            if (!failures.isEmpty()) {
                // Rollback successful ones
                List<MenuServiceClient.StockReservationDto> successes = results.stream()
                        .filter(MenuServiceClient.StockReservationDto::isSuccess)
                        .collect(Collectors.toList());
                if (!successes.isEmpty()) {
                    menuServiceClient.releaseStock(successes);
                }
                String failedItems = failures.stream()
                        .map(f -> f.getMenuItemId() + " (available: " + f.getAvailable() + ")")
                        .collect(Collectors.joining(", "));
                throw new ConflictException("Insufficient stock for: " + failedItems);
            }
        } catch (ConflictException e) {
            throw e; // re-throw our stock error
        } catch (Exception e) {
            log.error("Menu service unavailable: {}", e.getMessage());
            throw new ServiceUnavailableException("Menu service unavailable. Please try again.");
        }

        // 4. Create order
        BigDecimal subtotal = calculateSubtotal(request.getItems());
        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deliveryFee = "delivery".equals(request.getDeliveryType()) ? DELIVERY_FEE : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(tax).add(deliveryFee).subtract(discount);

        List<Order.OrderItem> orderItems = request.getItems().stream()
                .map(item -> Order.OrderItem.builder()
                        .menuItemId(item.getMenuItemId())
                        .name(item.getName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .prepStation(item.getPrepStation() != null ? item.getPrepStation() : "general")
                        .build())
                .collect(Collectors.toList());

        Order.DeliveryAddress addr = null;
        if (request.getDeliveryAddress() != null) {
            addr = Order.DeliveryAddress.builder()
                    .street(request.getDeliveryAddress().getStreet())
                    .city(request.getDeliveryAddress().getCity())
                    .state(request.getDeliveryAddress().getState())
                    .zipCode(request.getDeliveryAddress().getZipCode())
                    .country(request.getDeliveryAddress().getCountry())
                    .build();
        }

        int dailyNum = billCounterService.getNextDailyNumber();

        Order order = Order.builder()
                .idempotencyKey(request.getIdempotencyKey())
                .dailyOrderNumber(dailyNum)
                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)
                .userPhone(userPhone)
                .items(orderItems)
                .subtotal(subtotal)
                .tax(tax)
                .deliveryFee(deliveryFee)
                .discount(discount)
                .couponCode(appliedCoupon)
                .total(total)
                .status("pending")
                .statusHistory(new ArrayList<>(List.of(
                        Order.StatusChange.builder()
                                .from("new")
                                .to("pending")
                                .changedBy(userId)
                                .changedAt(LocalDateTime.now())
                                .build()
                )))
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("pending")
                .deliveryType(request.getDeliveryType() != null ? request.getDeliveryType() : "dine-in")
                .deliveryAddress(addr)
                .specialInstructions(request.getSpecialInstructions())
                .hasReservation(request.isHasReservation())
                .reservationDate(request.getReservationDate())
                .reservationTime(request.getReservationTime())
                .numberOfGuests(request.getNumberOfGuests())
                .build();

        order = orderRepository.save(order);
        log.info("Order created: {} (daily #{}) for user {}", order.getId(), dailyNum, userId);

        // 5. Fan-out kitchen tickets by prep station
        fanOutKitchenTickets(order);

        // 6. SSE push
        sseEmitterRegistry.sendOrderUpdate(userId, order);

        return order;
    }

    // ── Order CRUD ───────────────────────────────────────────────────────────

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByUser(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order getOrderById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    public Order updateOrder(String id, UpdateOrderRequest request, String changedBy) {
        Order order = getOrderById(id);
        if (request.getStatus() != null) {
            updateStatus(order, request.getStatus(), changedBy);
        }
        if (request.getPaymentStatus() != null) {
            order.setPaymentStatus(request.getPaymentStatus());
        }
        order = orderRepository.save(order);
        sseEmitterRegistry.sendOrderUpdate(order.getUserId(), order);
        return order;
    }

    public Order updateStatus(String id, String newStatus, String changedBy) {
        Order order = getOrderById(id);
        updateStatus(order, newStatus, changedBy);
        order = orderRepository.save(order);
        sseEmitterRegistry.sendOrderUpdate(order.getUserId(), order);
        return order;
    }

    private void updateStatus(Order order, String newStatus, String changedBy) {
        String oldStatus = order.getStatus();
        order.setStatus(newStatus);
        order.getStatusHistory().add(Order.StatusChange.builder()
                .from(oldStatus)
                .to(newStatus)
                .changedBy(changedBy)
                .changedAt(LocalDateTime.now())
                .build());
    }

    // ── Bill ─────────────────────────────────────────────────────────────────

    public Order getBill(String id) {
        return getOrderById(id);
    }

    // ── CSV export ───────────────────────────────────────────────────────────

    public String exportCsv() {
        List<Order> orders = orderRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("id,dailyNumber,userId,userName,total,status,paymentStatus,deliveryType,createdAt\n");
        for (Order o : orders) {
            sb.append(o.getId()).append(",");
            sb.append(o.getDailyOrderNumber()).append(",");
            sb.append(o.getUserId()).append(",");
            sb.append(csvEscape(o.getUserName())).append(",");
            sb.append(o.getTotal()).append(",");
            sb.append(o.getStatus()).append(",");
            sb.append(o.getPaymentStatus()).append(",");
            sb.append(o.getDeliveryType()).append(",");
            sb.append(o.getCreatedAt()).append("\n");
        }
        return sb.toString();
    }

    // ── Kitchen tickets ──────────────────────────────────────────────────────

    public List<KitchenTicket> getKitchenTickets() {
        return kitchenTicketRepository.findByStatusIn(List.of("QUEUED", "IN_PROGRESS"));
    }

    public KitchenTicket updateTicketStatus(String ticketId, String newStatus) {
        KitchenTicket ticket = kitchenTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("KitchenTicket", "id", ticketId));

        ticket.setStatus(newStatus);
        if ("IN_PROGRESS".equals(newStatus)) {
            ticket.setStartedAt(LocalDateTime.now());
        } else if ("READY".equals(newStatus)) {
            ticket.setReadyAt(LocalDateTime.now());
            if (ticket.getStartedAt() != null) {
                ticket.setElapsedSeconds(
                        java.time.Duration.between(ticket.getStartedAt(), ticket.getReadyAt()).getSeconds());
            }
        }

        ticket = kitchenTicketRepository.save(ticket);
        sseEmitterRegistry.sendKitchenUpdate(ticket);

        // Check if all tickets for this order are READY → auto-transition order to "ready"
        checkAllTicketsReady(ticket.getOrderId());

        return ticket;
    }

    // ── Analytics ────────────────────────────────────────────────────────────

    public DashboardAnalytics getDashboardAnalytics() {
        List<Order> allOrders = orderRepository.findAll();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);
        List<Order> todayOrders = orderRepository.findByCreatedAtBetween(todayStart, todayEnd);

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> !"cancelled".equals(o.getStatus()))
                .map(Order::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal todayRevenue = todayOrders.stream()
                .filter(o -> !"cancelled".equals(o.getStatus()))
                .map(Order::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> byStatus = allOrders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));

        BigDecimal avgOrder = allOrders.isEmpty() ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(allOrders.size()), 2, RoundingMode.HALF_UP);

        return DashboardAnalytics.builder()
                .totalOrders(allOrders.size())
                .totalRevenue(totalRevenue)
                .averageOrderValue(avgOrder)
                .ordersByStatus(byStatus)
                .todayOrders(todayOrders.size())
                .todayRevenue(todayRevenue)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private BigDecimal calculateSubtotal(List<CreateOrderRequest.OrderItemDto> items) {
        return items.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Coupon validateAndApplyCoupon(String code, BigDecimal subtotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new BadRequestException("Invalid coupon code: " + code));

        if (!coupon.isActive()) throw new BadRequestException("Coupon is inactive");
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon has expired");
        }
        if (coupon.getUsageLimit() > 0 && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit reached");
        }
        if (coupon.getMinOrderAmount() != null && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Minimum order amount not met: " + coupon.getMinOrderAmount());
        }

        // Increment usage
        coupon.setUsageCount(coupon.getUsageCount() + 1);
        couponRepository.save(coupon);

        return coupon;
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        BigDecimal discount;
        if ("percentage".equals(coupon.getDiscountType())) {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getDiscountValue();
        }
        if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
            discount = coupon.getMaxDiscount();
        }
        return discount;
    }

    private void fanOutKitchenTickets(Order order) {
        // Group items by prepStation
        Map<String, List<Order.OrderItem>> byStation = order.getItems().stream()
                .collect(Collectors.groupingBy(Order.OrderItem::getPrepStation));

        for (Map.Entry<String, List<Order.OrderItem>> entry : byStation.entrySet()) {
            List<KitchenTicket.TicketItem> ticketItems = entry.getValue().stream()
                    .map(oi -> KitchenTicket.TicketItem.builder()
                            .menuItemId(oi.getMenuItemId())
                            .name(oi.getName())
                            .quantity(oi.getQuantity())
                            .build())
                    .collect(Collectors.toList());

            KitchenTicket ticket = KitchenTicket.builder()
                    .orderId(order.getId())
                    .prepStation(entry.getKey())
                    .items(ticketItems)
                    .status("QUEUED")
                    .build();

            ticket = kitchenTicketRepository.save(ticket);
            sseEmitterRegistry.sendKitchenUpdate(ticket);
        }
    }

    private void checkAllTicketsReady(String orderId) {
        List<KitchenTicket> tickets = kitchenTicketRepository.findByOrderId(orderId);
        boolean allReady = tickets.stream().allMatch(t -> "READY".equals(t.getStatus()));
        if (allReady && !tickets.isEmpty()) {
            Order order = getOrderById(orderId);
            if ("preparing".equals(order.getStatus()) || "pending".equals(order.getStatus())) {
                updateStatus(order, "ready", "system");
                orderRepository.save(order);
                sseEmitterRegistry.sendOrderUpdate(order.getUserId(), order);
                log.info("All tickets ready — order {} auto-transitioned to 'ready'", orderId);
            }
        }
    }

    private String csvEscape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}

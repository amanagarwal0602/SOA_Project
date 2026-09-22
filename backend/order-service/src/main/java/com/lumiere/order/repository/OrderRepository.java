package com.lumiere.order.repository;

import com.lumiere.order.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByUserId(String userId);

    List<Order> findByStatus(String status);

    Optional<Order> findByIdempotencyKey(String idempotencyKey);

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Order> findByUserIdAndStatus(String userId, String status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}

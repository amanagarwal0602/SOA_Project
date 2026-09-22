package com.lumiere.order.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "kitchen_tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenTicket {

    @Id
    private String id;

    @Indexed
    private String orderId;

    private String prepStation;  // grill | cold | bar | pastry | general

    @Builder.Default
    private List<TicketItem> items = new ArrayList<>();

    @Builder.Default
    private String status = "QUEUED";   // QUEUED | IN_PROGRESS | READY

    private LocalDateTime startedAt;
    private LocalDateTime readyAt;

    @Builder.Default
    private long elapsedSeconds = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketItem {
        private String menuItemId;
        private String name;
        private int quantity;
    }
}

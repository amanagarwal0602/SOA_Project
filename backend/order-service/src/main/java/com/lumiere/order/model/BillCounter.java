package com.lumiere.order.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Atomic daily bill number counter.
 * One document per date (YYYY-MM-DD), seq incremented atomically via findAndModify.
 */
@Document(collection = "bill_counters")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillCounter {

    @Id
    private String id;

    @Indexed(unique = true)
    private String date;  // YYYY-MM-DD

    @Builder.Default
    private int seq = 0;
}

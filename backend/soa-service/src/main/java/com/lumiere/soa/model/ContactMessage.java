package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessage {

    @Id
    private String id;

    @Builder.Default
    @JsonProperty("table_type")
    private String tableType = "contact_message";

    private String name;

    private String email;

    private String phone;

    private String subject;

    @Column(length = 4000)
    private String message;

    @JsonProperty("is_read")
    @Builder.Default
    private boolean isRead = false;

    @JsonProperty("created_at")
    private String createdAt;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = "msg_" + System.currentTimeMillis();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now().toString();
        }
    }

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id;
    }
}

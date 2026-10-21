package com.lumiere.soa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cafe_content")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CafeContent {

    @Id
    private String contentKey;

    @Column(length = 20000)
    private String contentJson;

    private String updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now().toString();
    }
}

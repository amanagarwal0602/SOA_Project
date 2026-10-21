package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Skill 6: Library Management Microservice (CRUD)
 * Skill 7: Securing Library Service with JWT (RBAC)
 */
@Entity
@Table(name = "books")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("bookId")
    private Long bookId;

    @JsonProperty("bookName")
    private String bookName;

    @JsonProperty("bookPrice")
    private double bookPrice;

    private String author;

    public Book(Long bookId, String bookName, double bookPrice) {
        this.bookId = bookId;
        this.bookName = bookName;
        this.bookPrice = bookPrice;
    }
}

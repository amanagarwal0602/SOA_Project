package com.lumiere.soa.repository;

import com.lumiere.soa.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Skill 6: Library Management Microservice (CRUD)
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
}

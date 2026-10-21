package com.lumiere.soa.controller;

import com.lumiere.soa.model.Book;
import com.lumiere.soa.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Skill 6: Library Management Microservice (CRUD)
 * Skill 7: Securing Library Service with JWT (RBAC)
 */
@RestController
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // --- Skill 6: Standard CRUD (/books) ---

    @GetMapping("/books")
    public List<Book> getBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @PostMapping("/books")
    public Book addBook(@RequestBody Book book) {
        return bookService.addBook(book);
    }

    @PutMapping("/books/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        return ResponseEntity.ok(bookService.updateBook(id, book));
    }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.deleteBook(id));
    }

    // --- Skill 7: RBAC Protected Endpoints (/rbc/books) ---

    @GetMapping("/rbc/books")
    public Object getRbcBooks() {
        return bookService.getAllBooks();
    }

    @PostMapping("/rbc/books")
    public Object addRbcBook(@RequestBody Book book) {
        return bookService.addBook(book);
    }

    @PutMapping("/rbc/books/{id}")
    public Object updateRbcBook(@PathVariable Long id, @RequestBody Book book) {
        return bookService.updateBook(id, book);
    }

    @DeleteMapping("/rbc/books/{id}")
    public Object deleteRbcBook(@PathVariable Long id) {
        return bookService.deleteBook(id);
    }
}

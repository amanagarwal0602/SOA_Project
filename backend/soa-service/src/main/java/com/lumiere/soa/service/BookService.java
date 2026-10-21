package com.lumiere.soa.service;

import com.lumiere.soa.model.Book;
import com.lumiere.soa.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Skill 6: Library Management Microservice (CRUD)
 */
@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with ID: " + id));
    }

    public Book addBook(Book book) {
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book updatedBook) {
        Book existing = getBookById(id);
        existing.setBookName(updatedBook.getBookName());
        existing.setBookPrice(updatedBook.getBookPrice());
        existing.setAuthor(updatedBook.getAuthor());
        return bookRepository.save(existing);
    }

    public String deleteBook(Long id) {
        bookRepository.deleteById(id);
        return "Book deleted successfully";
    }
}

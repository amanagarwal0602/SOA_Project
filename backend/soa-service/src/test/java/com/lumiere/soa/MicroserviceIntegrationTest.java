package com.lumiere.soa;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lumiere.soa.model.Book;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Skill 10: Integration Testing of Library & SOA Microservices
 * End-to-end integration test verifying authentication, CORS, library CRUD, and order workflows.
 */
@SpringBootTest
@AutoConfigureMockMvc
class MicroserviceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Skill 5: CORS endpoint verification")
    void testCorsEndpoint() throws Exception {
        mockMvc.perform(get("/message")
                        .header("Origin", "http://localhost:3000"))
                .andExpect(status().isOk())
                .andExpect(content().string("Welcome to CORS"));
    }

    @Test
    @DisplayName("Skill 3 & 4: User Registration and JWT Login Flow")
    void testUserRegistrationAndLoginFlow() throws Exception {
        String testEmail = "testuser_" + System.currentTimeMillis() + "@example.com";
        Map<String, Object> registerRequest = Map.of(
                "name", "Test User",
                "email", testEmail,
                "password", "Secret123",
                "username", "testuser_" + (System.currentTimeMillis() % 10000)
        );

        // 1. Register
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()));

        // 2. Login
        Map<String, String> loginRequest = Map.of(
                "email", testEmail,
                "password", "Secret123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()));
    }

    @Test
    @DisplayName("Skill 1: Menu catalog retrieval")
    void testMenuRetrieval() throws Exception {
        mockMvc.perform(get("/api/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", notNullValue()));
    }

    @Test
    @DisplayName("Skill 6: Library Book CRUD integration workflow")
    void testLibraryBookCrudWorkflow() throws Exception {
        Book newBook = new Book(null, "SOA Architecture Design", 59.99, "Dr. KLU Faculty");

        // 1. Add Book
        String response = mockMvc.perform(post("/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newBook)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookName", is("SOA Architecture Design")))
                .andReturn().getResponse().getContentAsString();

        Book created = objectMapper.readValue(response, Book.class);
        Long id = created.getBookId();

        // 2. Retrieve Book
        mockMvc.perform(get("/books/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookName", is("SOA Architecture Design")));

        // 3. Delete Book
        mockMvc.perform(delete("/books/" + id))
                .andExpect(status().isOk())
                .andExpect(content().string("Book deleted successfully"));
    }
}

package com.lumiere.soa.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Skill 5: Securing APIs with CORS
 */
@RestController
@CrossOrigin(origins = "*")
public class CorsController {

    @GetMapping("/message")
    public String getMessage() {
        return "Welcome to CORS";
    }
}

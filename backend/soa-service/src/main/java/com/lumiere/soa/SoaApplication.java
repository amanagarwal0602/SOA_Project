package com.lumiere.soa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Main Spring Boot Application for SoA Programming & Microservices.
 * Covers Skills 1 to 12 from the course workbook.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class SoaApplication {
    public static void main(String[] args) {
        SpringApplication.run(SoaApplication.class, args);
    }
}

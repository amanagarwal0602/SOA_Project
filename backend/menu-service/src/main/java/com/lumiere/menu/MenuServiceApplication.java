package com.lumiere.menu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Menu Service (:8082)
 * Menu items, categories, stock, CSV import/export, Caffeine cache.
 * Full implementation: Phase 3.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class MenuServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MenuServiceApplication.class, args);
    }
}

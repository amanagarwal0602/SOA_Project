package com.lumiere.cafe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Café Service (:8084)
 * Reservations, gallery, reviews, CMS (hero/about/features/team/contact), site settings, SEO.
 * Full implementation: Phase 5.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class CafeServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CafeServiceApplication.class, args);
    }
}

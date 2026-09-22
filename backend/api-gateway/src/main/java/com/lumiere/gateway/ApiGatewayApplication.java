package com.lumiere.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Lumière Café API Gateway (:8080).
 *
 * Responsibilities:
 *  - Single entry-point for the React client
 *  - JWT signature + expiry validation (rejects early)
 *  - Correlation-ID propagation across all services
 *  - Rate limiting on /api/auth/** (Bucket4j in-memory)
 *  - Route discovery via Eureka (lb:// URIs — no hardcoded service addresses)
 *  - CORS (configured in application.yml, origin from ALLOWED_ORIGIN env)
 *  - OpenAPI aggregation (springdoc)
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}

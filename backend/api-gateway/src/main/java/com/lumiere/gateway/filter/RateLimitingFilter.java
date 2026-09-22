package com.lumiere.gateway.filter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory rate-limiting filter applied to /api/auth/** endpoints.
 *
 * Execution order: -200 (after CorrelationId at -300, before JWT at -100)
 *
 * Uses Bucket4j token-bucket algorithm keyed by client IP.
 * Default: 20 requests / minute per IP.
 *
 * For production scale, swap the ConcurrentHashMap for a Redis-backed Bucket4j
 * implementation (bucket4j-redis) without changing the filter logic.
 */
@Slf4j
@Component
public class RateLimitingFilter implements GlobalFilter, Ordered {

    @Value("${app.rate-limit.auth.capacity:20}")
    private int capacity;

    @Value("${app.rate-limit.auth.refill-tokens:20}")
    private int refillTokens;

    @Value("${app.rate-limit.auth.refill-period-minutes:1}")
    private int refillPeriodMinutes;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        // Only rate-limit the auth namespace
        if (!path.startsWith("/api/auth/")) {
            return chain.filter(exchange);
        }

        String clientIp = resolveClientIp(exchange.getRequest());
        Bucket bucket   = buckets.computeIfAbsent(clientIp, k -> createBucket());

        if (bucket.tryConsume(1)) {
            return chain.filter(exchange);
        }

        log.warn("Rate limit exceeded for IP={} path={}", clientIp, path);
        return writeTooManyRequests(exchange);
    }

    private Bucket createBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillIntervally(refillTokens, Duration.ofMinutes(refillPeriodMinutes))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private String resolveClientIp(ServerHttpRequest request) {
        String xff = request.getHeaders().getFirst("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        InetSocketAddress remoteAddress = request.getRemoteAddress();
        return remoteAddress != null
                ? remoteAddress.getAddress().getHostAddress()
                : "unknown";
    }

    private Mono<Void> writeTooManyRequests(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        exchange.getResponse().getHeaders().set("Retry-After", String.valueOf(refillPeriodMinutes * 60));

        String body = "{\"success\":false,\"message\":\"Too many requests. Please wait before trying again.\"}";
        DataBuffer buffer = exchange.getResponse().bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -200;
    }
}

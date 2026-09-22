package com.lumiere.gateway.filter;

import com.lumiere.common.security.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Set;

/**
 * Gateway-level JWT authentication filter.
 *
 * Execution order: -100 (after CorrelationIdFilter at -300, after RateLimitingFilter at -200)
 *
 * What it does:
 *  1. Skips public routes (GET menu/gallery/CMS + auth POSTs + contact form)
 *  2. Extracts and validates the Bearer token (signature + expiry)
 *  3. Forwards user identity as X-User-* headers to downstream services
 *     — downstream services ALSO validate independently (defense in depth)
 *  4. Returns 401 JSON on any failure
 *
 * NOTE: Admin-specific route /api/admin/** paths are also handled here;
 *       the gateway rewrites them via RewritePath filter in application.yml.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX         = "Bearer ";

    private final JwtUtil jwtUtil;

    // ── Public POST paths (no token required) ─────────────────────────────────
    private static final Set<String> PUBLIC_POST_PATHS = Set.of(
            "/api/auth/signup",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/contact-info/send-message",
            "/api/contact"
    );

    // ── Public GET path prefixes (no token required) ──────────────────────────
    private static final List<String> PUBLIC_GET_PREFIXES = List.of(
            "/api/menu",
            "/api/todays-offers",
            "/api/gallery",
            "/api/reviews",
            "/api/hero",
            "/api/about",
            "/api/features",
            "/api/team",
            "/api/contact-info",
            "/api/site-settings",
            "/api/seo",
            "/api/reservations/availability",
            // Actuator endpoints (internal — usually blocked at network level in prod)
            "/actuator"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path   = request.getPath().value();
        String method = request.getMethod().name();

        // Skip auth for public routes
        if (isPublicRoute(path, method)) {
            return chain.filter(exchange);
        }

        // Extract Authorization header
        String authHeader = request.getHeaders().getFirst(AUTHORIZATION_HEADER);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.debug("Missing or malformed Authorization header for path: {}", path);
            return writeUnauthorized(exchange, "Authentication required");
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        try {
            Claims claims = jwtUtil.validateAndExtractClaims(token);

            String userId = claims.getSubject();
            String role   = claims.get("role",  String.class);
            String email  = claims.get("email", String.class);

            @SuppressWarnings("unchecked")
            List<String> permissions = claims.get("permissions", List.class);
            String permissionsHeader = (permissions != null) ? String.join(",", permissions) : "";

            // Mutate the request: add identity headers for downstream services
            ServerHttpRequest mutated = request.mutate()
                    .header("X-User-Id",          userId          != null ? userId          : "")
                    .header("X-User-Role",         role            != null ? role            : "")
                    .header("X-User-Email",        email           != null ? email           : "")
                    .header("X-User-Permissions",  permissionsHeader)
                    .build();

            log.debug("JWT valid — userId={} role={} path={}", userId, role, path);
            return chain.filter(exchange.mutate().request(mutated).build());

        } catch (ExpiredJwtException e) {
            log.debug("Expired JWT for path {}: {}", path, e.getMessage());
            return writeUnauthorized(exchange, "Token has expired. Please log in again.");
        } catch (JwtException e) {
            log.debug("Invalid JWT for path {}: {}", path, e.getMessage());
            return writeUnauthorized(exchange, "Invalid authentication token.");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean isPublicRoute(String path, String method) {
        if (HttpMethod.GET.name().equals(method)) {
            return PUBLIC_GET_PREFIXES.stream().anyMatch(path::startsWith)
                    || path.equals("/api/reservations/availability");
        }
        if (HttpMethod.POST.name().equals(method)) {
            return PUBLIC_POST_PATHS.contains(path);
        }
        // OPTIONS always public (CORS pre-flight)
        if (HttpMethod.OPTIONS.name().equals(method)) {
            return true;
        }
        return false;
    }

    private Mono<Void> writeUnauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String correlationId = exchange.getRequest().getHeaders()
                .getFirst("X-Correlation-Id");
        String body = String.format(
                "{\"success\":false,\"message\":\"%s\",\"timestamp\":\"%s\",\"path\":\"%s\",\"correlationId\":\"%s\"}",
                message,
                Instant.now(),
                exchange.getRequest().getPath().value(),
                correlationId != null ? correlationId : ""
        );

        DataBuffer buffer = exchange.getResponse().bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100;   // Runs after Correlation (-300) and RateLimit (-200), before routing
    }
}

package com.lumiere.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Correlation-ID propagation filter.
 *
 * Execution order: -300 (first filter in the chain)
 *
 * - Reads X-Correlation-Id from the incoming request (set by client or upstream proxy).
 * - Generates a fresh UUID if absent.
 * - Forwards it as a request header to all downstream services.
 * - Echoes it back on the response header so the client can correlate logs.
 *
 * Each downstream service should read X-Correlation-Id from the request and
 * include it in every log line (e.g. via MDC) and in ApiResponse.correlationId.
 */
@Slf4j
@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String correlationId = exchange.getRequest().getHeaders()
                .getFirst(CORRELATION_ID_HEADER);

        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        final String finalCorrelationId = correlationId;

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header(CORRELATION_ID_HEADER, finalCorrelationId)
                .build();

        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(mutatedRequest)
                .build();

        return chain.filter(mutatedExchange)
                .then(Mono.fromRunnable(() ->
                        mutatedExchange.getResponse().getHeaders()
                                .set(CORRELATION_ID_HEADER, finalCorrelationId)));
    }

    @Override
    public int getOrder() {
        return -300;   // Must run first — before rate limiting and JWT validation
    }
}

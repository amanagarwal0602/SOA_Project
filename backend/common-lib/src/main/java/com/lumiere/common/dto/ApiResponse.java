package com.lumiere.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

/**
 * Standard API response envelope used by all Lumière Café microservices.
 * Shape: { success, message, data, errors[], timestamp, path, correlationId }
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private List<ErrorDetail> errors;
    private String timestamp;
    private String path;
    private String correlationId;

    // ── Factory helpers ───────────────────────────────────────────────────────

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(Instant.now().toString())
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Success");
    }

    public static <T> ApiResponse<T> ok() {
        return ApiResponse.<T>builder()
                .success(true)
                .message("OK")
                .timestamp(Instant.now().toString())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, List<ErrorDetail> errors,
                                            String path, String correlationId) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errors(errors)
                .path(path)
                .correlationId(correlationId)
                .timestamp(Instant.now().toString())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(Instant.now().toString())
                .build();
    }
}

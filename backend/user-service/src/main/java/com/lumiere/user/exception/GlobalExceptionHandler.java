package com.lumiere.user.exception;

import com.lumiere.common.dto.ApiResponse;
import com.lumiere.common.dto.ErrorDetail;
import com.lumiere.common.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Centralized exception handler for user-service.
 * Maps domain exceptions to consistent ApiResponse error envelopes.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ── Bean Validation (400) ────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<ErrorDetail> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::toErrorDetail)
                .collect(Collectors.toList());

        String correlationId = request.getHeader("X-Correlation-Id");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed", errors,
                        request.getRequestURI(), correlationId));
    }

    // ── Bad Request (400) ────────────────────────────────────────────────────

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(
            BadRequestException ex, HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // ── Unauthorized (401) ───────────────────────────────────────────────────

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(
            UnauthorizedException ex, HttpServletRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    // ── Forbidden (403) ──────────────────────────────────────────────────────

    @ExceptionHandler({ForbiddenException.class, AccessDeniedException.class})
    public ResponseEntity<ApiResponse<Void>> handleForbidden(
            Exception ex, HttpServletRequest request) {
        return buildError(HttpStatus.FORBIDDEN,
                "Access denied: insufficient permissions", request);
    }

    // ── Not Found (404) ──────────────────────────────────────────────────────

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // ── Conflict (409) ───────────────────────────────────────────────────────

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Void>> handleConflict(
            ConflictException ex, HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    // ── File upload too large ────────────────────────────────────────────────

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleUploadSize(
            MaxUploadSizeExceededException ex, HttpServletRequest request) {
        return buildError(HttpStatus.PAYLOAD_TOO_LARGE,
                "File too large. Maximum upload size exceeded.", request);
    }

    // ── Catch-all (500) ──────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again.", request);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private ResponseEntity<ApiResponse<Void>> buildError(
            HttpStatus status, String message, HttpServletRequest request) {
        String correlationId = request.getHeader("X-Correlation-Id");
        return ResponseEntity.status(status)
                .body(ApiResponse.error(message, null,
                        request.getRequestURI(), correlationId));
    }

    private ErrorDetail toErrorDetail(FieldError fe) {
        return ErrorDetail.builder()
                .field(fe.getField())
                .message(fe.getDefaultMessage())
                .rejectedValue(fe.getRejectedValue())
                .build();
    }
}

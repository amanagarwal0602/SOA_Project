package com.lumiere.common.exception;

/** Thrown for invalid input or business rule violations (maps to HTTP 400). */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}

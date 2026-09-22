package com.lumiere.common.exception;

/** Thrown when a resource already exists or a unique constraint is violated (HTTP 409). */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}

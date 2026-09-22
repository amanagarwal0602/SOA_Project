package com.lumiere.common.exception;

/** Thrown when a user lacks the required permission (HTTP 403). */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}

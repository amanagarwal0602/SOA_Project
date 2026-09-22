package com.lumiere.common.exception;

/** Thrown when authentication fails or a token is invalid/missing (HTTP 401). */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}

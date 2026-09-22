package com.lumiere.common.exception;

/** Thrown when a downstream service is unavailable (HTTP 503). */
public class ServiceUnavailableException extends RuntimeException {
    public ServiceUnavailableException(String message) {
        super(message);
    }

    public ServiceUnavailableException(String service, Throwable cause) {
        super(service + " is currently unavailable. Please try again later.", cause);
    }
}

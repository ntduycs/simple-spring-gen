package com.example.demo.exception;

import lombok.Getter;

@Getter
public class UnexpectedException extends RuntimeException {
    private final String exception;
    private final String message;

    public UnexpectedException(String message) {
        super(message);
        this.message = message;
        this.exception = RuntimeException.class.getSimpleName();
    }

    public UnexpectedException(String message, Throwable cause) {
        super(message, cause);
        this.message = message;
        this.exception = cause.getClass().getSimpleName();
    }

    public UnexpectedException(String message, String exception) {
        this.message = message;
        this.exception = exception;
    }
}

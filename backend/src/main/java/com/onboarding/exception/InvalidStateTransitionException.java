package com.onboarding.exception;

/**
 * Exception thrown when a state transition is invalid
 * (e.g., verifying a document that is not in SUBMITTED status).
 */
public class InvalidStateTransitionException extends RuntimeException {

    public InvalidStateTransitionException(String message) {
        super(message);
    }

    public InvalidStateTransitionException(String currentState, String targetState) {
        super(String.format("Cannot transition from %s to %s", currentState, targetState));
    }
}

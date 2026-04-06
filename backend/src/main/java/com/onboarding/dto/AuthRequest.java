package com.onboarding.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for Google authentication.
 * Contains the Firebase ID token from the frontend.
 */
@Data
public class AuthRequest {

    @NotBlank(message = "ID token is required")
    private String idToken;
}

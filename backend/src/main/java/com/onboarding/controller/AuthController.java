package com.onboarding.controller;

import com.onboarding.dto.ApiResponse;
import com.onboarding.dto.AuthRequest;
import com.onboarding.dto.AuthResponse;
import com.onboarding.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for authentication endpoints.
 * Handles Google login via Firebase token verification.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/google
     * Verify Firebase ID token and return user details.
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticateWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}

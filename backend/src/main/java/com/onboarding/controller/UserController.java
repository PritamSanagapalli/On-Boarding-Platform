package com.onboarding.controller;

import com.onboarding.dto.ApiResponse;
import com.onboarding.dto.UserDTO;
import com.onboarding.model.User;
import com.onboarding.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for user management endpoints.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users
     * List all users (typically used by admin to assign tasks).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * GET /api/users/{id}
     * Get a user by their ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * GET /api/users/me
     * Get the currently authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(
            @AuthenticationPrincipal User currentUser) {
        UserDTO user = userService.toDTO(currentUser);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}

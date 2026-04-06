package com.onboarding.controller;

import com.onboarding.dto.ApiResponse;
import com.onboarding.dto.DashboardAdminDTO;
import com.onboarding.dto.DashboardEmployeeDTO;
import com.onboarding.exception.UnauthorizedException;
import com.onboarding.model.User;
import com.onboarding.model.enums.Role;
import com.onboarding.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for dashboard statistics endpoints.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/dashboard/admin
     * Get admin dashboard statistics (Admin only).
     */
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<DashboardAdminDTO>> getAdminDashboard(
            @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can access admin dashboard");
        }
        DashboardAdminDTO dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    /**
     * GET /api/dashboard/employee
     * Get employee dashboard statistics.
     */
    @GetMapping("/employee")
    public ResponseEntity<ApiResponse<DashboardEmployeeDTO>> getEmployeeDashboard(
            @AuthenticationPrincipal User currentUser) {
        DashboardEmployeeDTO dashboard = dashboardService.getEmployeeDashboard(currentUser);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}

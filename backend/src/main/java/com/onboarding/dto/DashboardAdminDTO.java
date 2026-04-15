package com.onboarding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for admin dashboard statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAdminDTO {

    private long totalEmployees;
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private List<EmployeeProgressDTO> employeeProgress;

    /**
     * Nested DTO showing per-employee progress.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeProgressDTO {
        private Long userId;
        private String name;
        private String email;
        private String profilePicture;
        private long totalTasks;
        private long completedTasks;
        private long pendingDocuments;
        private long submittedDocuments;
        private long approvedDocuments;
        private long rejectedDocuments;
    }
}

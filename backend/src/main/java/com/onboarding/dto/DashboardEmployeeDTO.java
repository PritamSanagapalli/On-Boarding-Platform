package com.onboarding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for employee dashboard statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardEmployeeDTO {

    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long pendingDocuments;
    private long submittedDocuments;
    private List<TaskDTO> upcomingDeadlines;
}

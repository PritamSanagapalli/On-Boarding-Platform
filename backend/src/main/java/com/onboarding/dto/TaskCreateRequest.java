package com.onboarding.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * Request DTO for creating or updating a task.
 */
@Data
public class TaskCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String status;

    private String priority;

    private LocalDate deadline;

    @NotNull(message = "Assigned user ID is required")
    private Long assignedToId;
}

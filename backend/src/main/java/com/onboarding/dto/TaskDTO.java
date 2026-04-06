package com.onboarding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for task data exposed via API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {

    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate deadline;
    private UserDTO assignedTo;
    private UserDTO createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

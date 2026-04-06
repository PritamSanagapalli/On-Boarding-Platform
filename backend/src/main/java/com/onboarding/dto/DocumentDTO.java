package com.onboarding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for document data exposed via API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {

    private Long id;
    private String documentName;
    private String fileUrl;
    private String status;
    private UserDTO user;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

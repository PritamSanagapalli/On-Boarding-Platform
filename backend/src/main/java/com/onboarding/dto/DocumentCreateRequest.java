package com.onboarding.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for creating a document request.
 */
@Data
public class DocumentCreateRequest {

    @NotBlank(message = "Document name is required")
    private String documentName;

    @NotNull(message = "User ID is required")
    private Long userId;
}

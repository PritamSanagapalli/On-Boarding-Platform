package com.onboarding.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Request DTO for verifying (approving/rejecting) a document.
 */
@Data
public class DocumentVerifyRequest {

    @NotNull(message = "Status is required")
    @Pattern(regexp = "APPROVED|REJECTED", message = "Status must be APPROVED or REJECTED")
    private String status;

    /**
     * Optional feedback from the admin reviewer.
     */
    private String feedback;
}

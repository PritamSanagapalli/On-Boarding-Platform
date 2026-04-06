package com.onboarding.controller;

import com.onboarding.dto.ApiResponse;
import com.onboarding.dto.DocumentCreateRequest;
import com.onboarding.dto.DocumentDTO;
import com.onboarding.model.User;
import com.onboarding.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for document management endpoints.
 */
@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * POST /api/documents
     * Request a document from an employee (Admin only).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DocumentDTO>> createDocumentRequest(
            @Valid @RequestBody DocumentCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        DocumentDTO document = documentService.createDocumentRequest(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document requested successfully", document));
    }

    /**
     * GET /api/documents/user/{userId}
     * Get all documents for a user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> getDocumentsByUser(
            @PathVariable Long userId) {
        List<DocumentDTO> documents = documentService.getDocumentsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    /**
     * PUT /api/documents/{id}
     * Update a document (submit / add file URL).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentDTO>> updateDocument(
            @PathVariable Long id,
            @RequestBody DocumentDTO updateRequest,
            @AuthenticationPrincipal User currentUser) {
        DocumentDTO document = documentService.updateDocument(id, updateRequest, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Document updated successfully", document));
    }
}

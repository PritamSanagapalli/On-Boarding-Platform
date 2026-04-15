package com.onboarding.controller;

import com.onboarding.dto.ApiResponse;
import com.onboarding.dto.DocumentCreateRequest;
import com.onboarding.dto.DocumentDTO;
import com.onboarding.dto.DocumentVerifyRequest;
import com.onboarding.model.User;
import com.onboarding.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DocumentDTO>> createDocumentRequest(
            @Valid @RequestBody DocumentCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        DocumentDTO document = documentService.createDocumentRequest(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document requested successfully", document));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> getAllDocuments() {
        List<DocumentDTO> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> getDocumentsByUser(
            @PathVariable Long userId) {
        List<DocumentDTO> documents = documentService.getDocumentsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentDTO>> updateDocument(
            @PathVariable Long id,
            @RequestBody DocumentDTO updateRequest,
            @AuthenticationPrincipal User currentUser) {
        DocumentDTO document = documentService.updateDocument(id, updateRequest, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Document updated successfully", document));
    }

    /**
     * PUT /api/documents/{id}/verify
     *
     * Verify (approve or reject) a submitted document.
     * Only accessible by ADMIN users.
     *
     * @param id      the document ID
     * @param request verification request with status (APPROVED/REJECTED) and optional feedback
     * @return the updated document
     */
    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DocumentDTO>> verifyDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentVerifyRequest request,
            @AuthenticationPrincipal User currentUser) {
        DocumentDTO document = documentService.verifyDocument(id, request, currentUser);
        String action = "APPROVED".equals(request.getStatus()) ? "approved" : "rejected";
        return ResponseEntity.ok(ApiResponse.success("Document " + action + " successfully", document));
    }
}

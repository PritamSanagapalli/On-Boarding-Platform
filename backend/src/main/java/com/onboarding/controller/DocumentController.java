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
}

package com.onboarding.service;

import com.onboarding.dto.DocumentCreateRequest;
import com.onboarding.dto.DocumentDTO;
import com.onboarding.dto.DocumentVerifyRequest;
import com.onboarding.exception.InvalidStateTransitionException;
import com.onboarding.exception.ResourceNotFoundException;
import com.onboarding.exception.UnauthorizedException;
import com.onboarding.model.Document;
import com.onboarding.model.User;
import com.onboarding.model.enums.DocumentStatus;
import com.onboarding.model.enums.Role;
import com.onboarding.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final UserService userService;

    public DocumentService(DocumentRepository documentRepository, UserService userService) {
        this.documentRepository = documentRepository;
        this.userService = userService;
    }

    /**
     * Admin creates a document request for an employee.
     */
    public DocumentDTO createDocumentRequest(DocumentCreateRequest request, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can request documents");
        }

        User targetUser = userService.getUserEntityById(request.getUserId());

        Document document = Document.builder()
                .documentName(request.getDocumentName())
                .status(DocumentStatus.PENDING)
                .user(targetUser)
                .build();

        Document saved = documentRepository.save(document);
        logger.info("Document '{}' requested for user {} by admin {}",
                request.getDocumentName(), targetUser.getEmail(), currentUser.getEmail());
        return toDTO(saved);
    }

    /**
     * Get all documents (admin view).
     */
    public List<DocumentDTO> getAllDocuments() {
        return documentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get documents for a specific user.
     */
    public List<DocumentDTO> getDocumentsByUser(Long userId) {
        return documentRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Employee updates a document (submit file URL, change status to SUBMITTED).
     */
    public DocumentDTO updateDocument(Long id, DocumentDTO updateRequest, User currentUser) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));

        if (currentUser.getRole() == Role.EMPLOYEE &&
                !document.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only update your own documents");
        }

        if (updateRequest.getFileUrl() != null) {
            document.setFileUrl(updateRequest.getFileUrl());
        }
        if (updateRequest.getStatus() != null) {
            document.setStatus(DocumentStatus.valueOf(updateRequest.getStatus()));
        }

        Document updated = documentRepository.save(document);
        return toDTO(updated);
    }

    /**
     * Admin verifies (approves or rejects) a submitted document.
     *
     * Business rules:
     * - Only ADMIN users can verify documents
     * - Only documents in SUBMITTED status can be verified
     * - Status must be APPROVED or REJECTED
     * - Saves verifier reference and timestamp
     *
     * @param id            the document ID
     * @param request       verification request with status and optional feedback
     * @param currentUser   the admin performing the verification
     * @return updated DocumentDTO
     */
    @Transactional
    public DocumentDTO verifyDocument(Long id, DocumentVerifyRequest request, User currentUser) {
        // Role check (defense-in-depth — controller also checks via @PreAuthorize)
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can verify documents");
        }

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));

        // Validate state transition: only SUBMITTED → APPROVED/REJECTED
        if (document.getStatus() != DocumentStatus.SUBMITTED) {
            throw new InvalidStateTransitionException(
                    String.format("Document '%s' cannot be verified because it is in %s status. Only SUBMITTED documents can be verified.",
                            document.getDocumentName(), document.getStatus().name())
            );
        }

        DocumentStatus targetStatus = DocumentStatus.valueOf(request.getStatus());

        // Apply verification
        document.setStatus(targetStatus);
        document.setFeedback(request.getFeedback());
        document.setVerifiedBy(currentUser);
        document.setVerifiedAt(LocalDateTime.now());

        Document saved = documentRepository.save(document);

        logger.info("Document '{}' (ID: {}) {} by admin {} with feedback: {}",
                document.getDocumentName(), id, targetStatus.name(),
                currentUser.getEmail(), request.getFeedback());

        return toDTO(saved);
    }

    /**
     * Convert Document entity to DTO.
     */
    private DocumentDTO toDTO(Document document) {
        DocumentDTO.DocumentDTOBuilder builder = DocumentDTO.builder()
                .id(document.getId())
                .documentName(document.getDocumentName())
                .fileUrl(document.getFileUrl())
                .status(document.getStatus().name())
                .feedback(document.getFeedback())
                .user(userService.toDTO(document.getUser()))
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt());

        if (document.getVerifiedBy() != null) {
            builder.verifiedBy(userService.toDTO(document.getVerifiedBy()));
        }
        if (document.getVerifiedAt() != null) {
            builder.verifiedAt(document.getVerifiedAt());
        }

        return builder.build();
    }
}

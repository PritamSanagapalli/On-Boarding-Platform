package com.onboarding.service;

import com.onboarding.dto.DocumentCreateRequest;
import com.onboarding.dto.DocumentDTO;
import com.onboarding.exception.ResourceNotFoundException;
import com.onboarding.exception.UnauthorizedException;
import com.onboarding.model.Document;
import com.onboarding.model.User;
import com.onboarding.model.enums.DocumentStatus;
import com.onboarding.model.enums.Role;
import com.onboarding.repository.DocumentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserService userService;

    public DocumentService(DocumentRepository documentRepository, UserService userService) {
        this.documentRepository = documentRepository;
        this.userService = userService;
    }

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
        return toDTO(saved);
    }

    public List<DocumentDTO> getAllDocuments() {
        return documentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DocumentDTO> getDocumentsByUser(Long userId) {
        return documentRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

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

    private DocumentDTO toDTO(Document document) {
        return DocumentDTO.builder()
                .id(document.getId())
                .documentName(document.getDocumentName())
                .fileUrl(document.getFileUrl())
                .status(document.getStatus().name())
                .user(userService.toDTO(document.getUser()))
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}

package com.onboarding.repository;

import com.onboarding.model.Document;
import com.onboarding.model.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Document entity operations.
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, DocumentStatus status);
}

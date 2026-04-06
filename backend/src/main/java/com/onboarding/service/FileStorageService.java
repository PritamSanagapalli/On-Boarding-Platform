package com.onboarding.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service for handling file uploads.
 * Stores files locally in the configured upload directory.
 */
@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    private final Path uploadDir;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDirStr) {
        this.uploadDir = Paths.get(uploadDirStr).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
            logger.info("File upload directory: {}", this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDirStr, e);
        }
    }

    /**
     * Store a file and return the generated filename.
     */
    public String storeFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // Generate unique filename
        String storedFilename = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = this.uploadDir.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Stored file: {} as {}", originalFilename, storedFilename);
            return storedFilename;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file: " + originalFilename, e);
        }
    }

    /**
     * Load a file as a byte array.
     */
    public byte[] loadFile(String filename) {
        try {
            Path filePath = this.uploadDir.resolve(filename).normalize();
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("File not found: " + filename, e);
        }
    }

    /**
     * Get the content type of a file.
     */
    public String getContentType(String filename) {
        try {
            Path filePath = this.uploadDir.resolve(filename).normalize();
            String contentType = Files.probeContentType(filePath);
            return contentType != null ? contentType : "application/octet-stream";
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }

    /**
     * Delete a stored file.
     */
    public void deleteFile(String filename) {
        try {
            Path filePath = this.uploadDir.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            logger.warn("Could not delete file: {}", filename);
        }
    }
}

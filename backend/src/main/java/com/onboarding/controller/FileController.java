package com.onboarding.controller;

import com.onboarding.dto.ApiResponse;
import com.onboarding.service.FileStorageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Controller for file upload and download operations.
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * Upload a file. Returns the stored filename.
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File is empty"));
        }

        String filename = fileStorageService.storeFile(file);
        String downloadUrl = "/api/files/download/" + filename;

        Map<String, String> result = Map.of(
                "filename", filename,
                "originalName", file.getOriginalFilename() != null ? file.getOriginalFilename() : filename,
                "downloadUrl", downloadUrl,
                "size", String.valueOf(file.getSize())
        );

        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", result));
    }

    /**
     * Download a file by stored filename.
     */
    @GetMapping("/download/{filename}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String filename) {
        byte[] fileData = fileStorageService.loadFile(filename);
        String contentType = fileStorageService.getContentType(filename);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(fileData);
    }
}

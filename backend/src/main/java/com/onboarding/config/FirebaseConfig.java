package com.onboarding.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

/**
 * Initializes the Firebase Admin SDK on application startup.
 *
 * Supports two modes:
 * 1. FIREBASE_CONFIG env var: base64-encoded service account JSON (recommended for production)
 * 2. Classpath file: reads from firebase.config.path property (development)
 */
@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.config.path}")
    private String firebaseConfigPath;

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = getFirebaseCredentials();
                if (serviceAccount == null) {
                    logger.warn("No Firebase credentials found. Firebase authentication will not work.");
                    return;
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
                FirebaseApp.initializeApp(options);
                logger.info("Firebase Admin SDK initialized successfully");
            }
        } catch (IOException e) {
            logger.warn("Failed to initialize Firebase: {}. " +
                    "Firebase authentication will not work until configured.", e.getMessage());
        }
    }

    /**
     * Gets Firebase credentials from environment variable (base64) or classpath file.
     * Environment variable takes precedence for production deployments.
     */
    private InputStream getFirebaseCredentials() {
        // Priority 1: FIREBASE_CONFIG environment variable (base64-encoded JSON)
        String firebaseConfigEnv = System.getenv("FIREBASE_CONFIG");
        if (firebaseConfigEnv != null && !firebaseConfigEnv.isBlank()) {
            logger.info("Loading Firebase credentials from FIREBASE_CONFIG environment variable");
            try {
                byte[] decoded = Base64.getDecoder().decode(firebaseConfigEnv);
                return new ByteArrayInputStream(decoded);
            } catch (IllegalArgumentException e) {
                logger.error("FIREBASE_CONFIG environment variable contains invalid base64: {}", e.getMessage());
            }
        }

        // Priority 2: Classpath file
        try {
            InputStream stream = new ClassPathResource(firebaseConfigPath).getInputStream();
            logger.info("Loading Firebase credentials from classpath: {}", firebaseConfigPath);
            return stream;
        } catch (IOException e) {
            logger.warn("Firebase service account file not found at '{}': {}",
                    firebaseConfigPath, e.getMessage());
        }

        return null;
    }
}

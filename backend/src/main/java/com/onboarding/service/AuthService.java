package com.onboarding.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.onboarding.dto.AuthRequest;
import com.onboarding.dto.AuthResponse;
import com.onboarding.model.User;
import com.onboarding.model.enums.Role;
import com.onboarding.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Service handling Firebase authentication and user creation/lookup.
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Authenticates a user with a Firebase ID token.
     * Creates the user in the database if they don't exist.
     *
     * @param request the auth request containing the Firebase ID token
     * @return AuthResponse with user details
     */
    public AuthResponse authenticateWithGoogle(AuthRequest request) {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                throw new RuntimeException("Firebase is not initialized. Please configure firebase-service-account.json");
            }

            // Verify the Firebase ID token
            FirebaseToken firebaseToken = FirebaseAuth.getInstance()
                    .verifyIdToken(request.getIdToken());

            String uid = firebaseToken.getUid();
            String email = firebaseToken.getEmail();
            String name = firebaseToken.getName();
            String picture = firebaseToken.getPicture();

            logger.info("Firebase token verified for user: {}", email);

            // Find or create the user
            User user = userRepository.findByFirebaseUid(uid)
                    .orElseGet(() -> {
                        logger.info("Creating new user: {}", email);
                        User newUser = User.builder()
                                .firebaseUid(uid)
                                .email(email)
                                .name(name != null ? name : email)
                                .profilePicture(picture)
                                .role(Role.EMPLOYEE) // Default role
                                .build();
                        return userRepository.save(newUser);
                    });

            // Update profile picture if changed
            if (picture != null && !picture.equals(user.getProfilePicture())) {
                user.setProfilePicture(picture);
                userRepository.save(user);
            }

            return AuthResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .profilePicture(user.getProfilePicture())
                    .token(request.getIdToken()) // Return the same token for frontend to use
                    .build();

        } catch (Exception e) {
            logger.error("Authentication failed: {}", e.getMessage());
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }
}

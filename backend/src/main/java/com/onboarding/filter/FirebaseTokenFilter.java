package com.onboarding.filter;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.onboarding.model.User;
import com.onboarding.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

/**
 * Security filter that validates Firebase ID tokens on every request.
 * Extracts the token from the Authorization header, verifies it with Firebase,
 * and sets the Spring Security authentication context.
 */
@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseTokenFilter.class);

    private final UserRepository userRepository;

    public FirebaseTokenFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                // Check if Firebase is initialized
                if (FirebaseApp.getApps().isEmpty()) {
                    logger.warn("Firebase not initialized, skipping token verification");
                    filterChain.doFilter(request, response);
                    return;
                }

                FirebaseToken firebaseToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String uid = firebaseToken.getUid();

                // Look up the user in our database
                Optional<User> userOpt = userRepository.findByFirebaseUid(uid);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    String role = "ROLE_" + user.getRole().name();

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    Collections.singletonList(new SimpleGrantedAuthority(role))
                            );
                    authentication.setDetails(
                            new org.springframework.security.web.authentication.WebAuthenticationDetailsSource()
                                    .buildDetails(request));

                    // Create a fresh SecurityContext and set it
                    org.springframework.security.core.context.SecurityContext context =
                            SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);

                    logger.debug("Authenticated user: {} with role: {}", user.getEmail(), role);
                } else {
                    logger.warn("User not found in database for Firebase UID: {}", uid);
                }
            } catch (Exception e) {
                logger.error("Failed to verify Firebase token: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip filtering for auth endpoint and health checks
        return path.startsWith("/api/auth/");
    }
}

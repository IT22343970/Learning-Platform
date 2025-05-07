package com.example.backend.service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String clientId;

    public GoogleAuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${google.oauth.client-id}") String clientId) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.clientId = clientId;
    }

    public User authenticateGoogleUser(String idTokenString) throws Exception {
        System.out.println("Using client ID: " + clientId);
        
        // Add more detailed token debugging (safely truncate the token for logging)
        String tokenDebug = idTokenString;
        if (tokenDebug != null && tokenDebug.length() > 20) {
            tokenDebug = tokenDebug.substring(0, 20) + "...";
        }
        System.out.println("Attempting to verify token: " + tokenDebug);

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .setIssuer("https://accounts.google.com")
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                System.err.println("Token verification failed - token is invalid");
                throw new IllegalArgumentException("Invalid Google ID token");
            }

            // Get user info from token
            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            
            // Log successful verification
            System.out.println("Successfully verified token for: " + email);
            
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");
            String picture = (String) payload.get("picture");

            // Check if user exists
            Optional<User> existingUserOpt = userRepository.findByEmail(email);
            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();
                // Update profile picture if needed
                if (picture != null && !picture.equals(existingUser.getProfilePicture())) {
                    existingUser.setProfilePicture(picture);
                    userRepository.save(existingUser);
                }
                
                // Generate a random password for OAuth users that won't be used for login
                // but needed for Basic Auth
                String randomPass = UUID.randomUUID().toString();
                existingUser.setRawPassword(randomPass);
                
                return existingUser;
            }

            // Create a new user
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFirstName(firstName != null ? firstName : "Google");
            newUser.setLastName(lastName != null ? lastName : "User");
            newUser.setProfilePicture(picture);
            
            // Generate a random secure password - users won't use this to log in
            String randomPassword = UUID.randomUUID().toString();
            newUser.setPassword(passwordEncoder.encode(randomPassword));
            newUser.setRawPassword(randomPassword); // For Basic Auth
            
            return userRepository.save(newUser);
        } catch (GeneralSecurityException | IOException e) {
            System.err.println("Google token verification failed with technical error: " + e.getMessage());
            e.printStackTrace(); // More detailed stack trace in logs
            throw new Exception("Failed to verify Google ID token: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error during Google authentication: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
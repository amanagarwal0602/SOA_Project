package com.lumiere.soa.controller;

import com.lumiere.soa.model.User;
import com.lumiere.soa.repository.UserRepository;
import com.lumiere.soa.security.JWTUtility;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Skill 3: User Registration System with Validation
 * Skill 4: Token-Based Authentication for Banking/Security API
 */
@RestController
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // --- Skill 4: Token-Based Authentication ---

    @PostMapping({"/api/auth/login", "/auth/login", "/login"})
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String identifier = credentials.get("email");
        if (identifier == null || identifier.isBlank()) {
            identifier = credentials.get("username");
        }
        String password = credentials.get("password");

        if (identifier == null || identifier.isBlank() || password == null || password.isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Email/Username and password are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        String lookup = identifier.trim().toLowerCase();

        // 1. Look up user by email or username
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(lookup);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameIgnoreCase(lookup);
        }

        // 2. Check demo/admin fallback if db not seeded yet
        if (userOpt.isEmpty()) {
            if (("admin@admin.com".equals(lookup) || "admin".equals(lookup)) && "admin".equals(password)) {
                User admin = User.builder()
                        .id("admin000")
                        .name("Admin")
                        .email("admin@admin.com")
                        .username("admin")
                        .password("admin")
                        .role("admin")
                        .phone("+91-98765-43211")
                        .addressCity("Mumbai")
                        .addressCountry("India")
                        .isActive(true)
                        .emailVerified(true)
                        .build();
                userRepository.save(admin);
                userOpt = Optional.of(admin);
            } else if (("demo@demo.com".equals(lookup) || "demo".equals(lookup)) && "demo".equals(password)) {
                User demo = User.builder()
                        .id("demo001")
                        .name("Demo User")
                        .email("demo@demo.com")
                        .username("demo")
                        .password("demo")
                        .role("customer")
                        .phone("+91-98765-43210")
                        .addressCity("Mumbai")
                        .addressCountry("India")
                        .isActive(true)
                        .emailVerified(true)
                        .build();
                userRepository.save(demo);
                userOpt = Optional.of(demo);
            }
        }

        if (userOpt.isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        User user = userOpt.get();

        // Password matching: plain text or BCrypt
        boolean matches = password.equals(user.getPassword()) ||
                (user.getPassword() != null && passwordEncoder.matches(password, user.getPassword()));

        if (!matches) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        // Generate JWT token
        String token = JWTUtility.generateToken(user.getUsername() != null ? user.getUsername() : user.getEmail(),
                user.getRole(), user.getId());

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("user", user);
        responseData.put("token", token);

        Map<String, Object> response = new HashMap<>();
        response.put("data", responseData);
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    // --- Skill 3: User Registration System with Validation ---

    @PostMapping({"/api/auth/register", "/auth/register", "/signup", "/register"})
    public ResponseEntity<?> register(@RequestBody Map<String, Object> userData) {
        String email = (String) userData.get("email");
        String password = (String) userData.get("password");
        String name = (String) userData.get("name");
        String username = (String) userData.get("username");

        // Validation Checks
        if (email == null || email.isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("code", 400);
            err.put("success", false);
            err.put("message", "Email is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        if (password == null || password.isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("code", 400);
            err.put("success", false);
            err.put("message", "Password is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        if (userRepository.existsByEmailIgnoreCase(email.trim())) {
            Map<String, Object> err = new HashMap<>();
            err.put("code", 400);
            err.put("success", false);
            err.put("message", "Email already registered");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        if (username != null && !username.isBlank() && userRepository.existsByUsernameIgnoreCase(username.trim())) {
            Map<String, Object> err = new HashMap<>();
            err.put("code", 400);
            err.put("success", false);
            err.put("message", "Username already taken");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        String userId = "user_" + System.currentTimeMillis();
        String role = (String) userData.getOrDefault("role", "customer");

        User newUser = User.builder()
                .id(userId)
                .name(name != null ? name : (username != null ? username : email.split("@")[0]))
                .email(email.trim().toLowerCase())
                .username(username != null && !username.isBlank() ? username.trim() : email.split("@")[0])
                .password(password)
                .role(role)
                .phone((String) userData.get("phone"))
                .addressStreet((String) userData.get("address_street"))
                .addressCity((String) userData.get("address_city"))
                .addressState((String) userData.get("address_state"))
                .addressZipcode((String) userData.get("address_zipcode"))
                .addressCountry((String) userData.get("address_country"))
                .isActive(true)
                .emailVerified(true)
                .build();

        userRepository.save(newUser);

        String token = JWTUtility.generateToken(newUser.getUsername(), newUser.getRole(), newUser.getId());

        Map<String, Object> data = new HashMap<>();
        data.put("user", newUser);
        data.put("token", token);

        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        response.put("success", true);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // --- Token Validation & User Info ---

    @GetMapping({"/api/auth/me", "/auth/me", "/api/auth/current-user", "/auth/current-user"})
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Unauthorized"));
        }

        String token = authHeader.substring(7);
        if (!JWTUtility.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid or expired token"));
        }

        String username = JWTUtility.getUsername(token);
        Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmailIgnoreCase(username);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "User not found"));
        }

        return ResponseEntity.ok(Map.of("data", userOpt.get(), "success", true));
    }

    @GetMapping({"/validate", "/api/auth/validate"})
    public String validate(@RequestHeader(value = "Authorization", defaultValue = "") String authorization) {
        String token = authorization.replace("Bearer ", "");
        boolean valid = JWTUtility.validateToken(token);
        return valid ? "Token is Valid" : "Token is Invalid or Expired";
    }

    @GetMapping({"/user", "/api/auth/user"})
    public String getUsernameFromToken(@RequestHeader(value = "Authorization", defaultValue = "") String authorization) {
        String token = authorization.replace("Bearer ", "");
        String username = JWTUtility.getUsername(token);
        return "username : " + username;
    }
}

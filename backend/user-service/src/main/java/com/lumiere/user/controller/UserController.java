package com.lumiere.user.controller;

import com.lumiere.common.dto.ApiResponse;
import com.lumiere.user.dto.request.*;
import com.lumiere.user.dto.response.UserResponse;
import com.lumiere.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

/**
 * User and Staff management endpoints.
 *
 * Admin CRUD:       /api/users, /api/users/{id}
 * Profile:          /api/users/profile
 * Favourites:       /api/users/favorites, /api/users/favorites/{menuItemId}
 * Staff management: /api/staff, /api/staff/{id}, /api/staff/{id}/permissions
 * Avatar upload:    /api/users/avatar
 */
@RestController
@RequiredArgsConstructor
public class UserController {

    private static final String UPLOAD_DIR = "uploads/avatars";

    private final UserService userService;

    // ══════════════════════════════════════════════════════════════════════════
    // Admin User CRUD — /api/users
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/api/users")
    @PreAuthorize("hasAuthority('view_users')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.listAllUsers()));
    }

    @PostMapping("/api/users")
    @PreAuthorize("hasAuthority('edit_users')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(user, "User created"));
    }

    @PutMapping("/api/users/{id}")
    @PreAuthorize("hasAuthority('edit_users')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id,
            @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUser(id, request), "User updated"));
    }

    @DeleteMapping("/api/users/{id}")
    @PreAuthorize("hasAuthority('delete_users')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted"));
    }

    @PatchMapping("/api/users/{id}/status")
    @PreAuthorize("hasAuthority('edit_users')")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(userService.toggleUserStatus(id), "Status updated"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Profile (own) — /api/users/profile
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/api/users/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(userId)));
    }

    @PutMapping("/api/users/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication auth,
            @RequestBody UpdateProfileRequest request) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateProfile(userId, request), "Profile updated"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Avatar Upload — /api/users/avatar
    // ══════════════════════════════════════════════════════════════════════════

    @PostMapping(value = "/api/users/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
            Authentication auth,
            @RequestParam("file") MultipartFile file) throws IOException {

        String userId = (String) auth.getPrincipal();

        // Create upload directory if needed
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String extension = "";
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String filename = userId + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        file.transferTo(filePath.toFile());

        // URL through gateway — served via static resource mapping
        String avatarUrl = "/uploads/avatars/" + filename;
        UserResponse updated = userService.updateAvatar(userId, avatarUrl);

        return ResponseEntity.ok(ApiResponse.success(updated, "Avatar uploaded"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Favourites — /api/users/favorites
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/api/users/favorites")
    public ResponseEntity<ApiResponse<List<String>>> getFavorites(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(userService.getFavorites(userId)));
    }

    @PostMapping("/api/users/favorites/{menuItemId}")
    public ResponseEntity<ApiResponse<List<String>>> addFavorite(
            Authentication auth,
            @PathVariable String menuItemId) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(
                userService.addFavorite(userId, menuItemId), "Added to favorites"));
    }

    @DeleteMapping("/api/users/favorites/{menuItemId}")
    public ResponseEntity<ApiResponse<List<String>>> removeFavorite(
            Authentication auth,
            @PathVariable String menuItemId) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(
                userService.removeFavorite(userId, menuItemId), "Removed from favorites"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Staff Management — /api/staff
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/api/staff")
    @PreAuthorize("hasAuthority('view_users')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listStaff() {
        return ResponseEntity.ok(ApiResponse.success(userService.listStaff()));
    }

    @PostMapping("/api/staff")
    @PreAuthorize("hasAuthority('manage_roles')")
    public ResponseEntity<ApiResponse<UserResponse>> createStaff(
            @Valid @RequestBody CreateUserRequest request) {
        UserResponse staff = userService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(staff, "Staff member created"));
    }

    @PutMapping("/api/staff/{id}")
    @PreAuthorize("hasAuthority('edit_users')")
    public ResponseEntity<ApiResponse<UserResponse>> updateStaff(
            @PathVariable String id,
            @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateStaff(id, request), "Staff member updated"));
    }

    @PutMapping("/api/staff/{id}/permissions")
    @PreAuthorize("hasAuthority('manage_roles')")
    public ResponseEntity<ApiResponse<UserResponse>> updateStaffPermissions(
            @PathVariable String id,
            @RequestBody UpdatePermissionsRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateStaffPermissions(id, request), "Permissions updated"));
    }
}

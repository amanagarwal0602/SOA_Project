package com.lumiere.user.service;

import com.lumiere.common.exception.*;
import com.lumiere.common.security.Permissions;
import com.lumiere.user.dto.request.*;
import com.lumiere.user.dto.response.UserResponse;
import com.lumiere.user.model.User;
import com.lumiere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * User management service — admin CRUD, profile self-update, favourites, staff management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Admin: list all users ────────────────────────────────────────────────

    public List<UserResponse> listAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    // ── Admin: get user by ID ────────────────────────────────────────────────

    public UserResponse getUserById(String id) {
        User user = findUserOrThrow(id);
        return UserResponse.from(user);
    }

    // ── Admin: create user ───────────────────────────────────────────────────

    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }
        if (request.getUsername() != null && !request.getUsername().isBlank()
                && userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
            throw new ConflictException("Username already taken");
        }

        String role = request.getRole() != null ? request.getRole().toLowerCase() : "customer";
        List<String> permissions = resolvePermissionsForRole(role);

        String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword() : "changeme123";

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .username(request.getUsername() != null && !request.getUsername().isBlank()
                        ? request.getUsername().trim() : null)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .phone(request.getPhone())
                .role(role)
                .avatar(request.getAvatar())
                .address(mapAddress(request.getAddress()))
                .permissions(permissions)
                .active(true)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        log.info("Admin created user: {} ({}) with role {}", user.getEmail(), user.getId(), role);
        return UserResponse.from(user);
    }

    // ── Admin: update user ───────────────────────────────────────────────────

    public UserResponse updateUser(String id, UpdateUserRequest request) {
        User user = findUserOrThrow(id);

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
        if (request.getAddress() != null) user.setAddress(mapAddress(request.getAddress()));
        if (request.getRole() != null) {
            String newRole = request.getRole().toLowerCase();
            user.setRole(newRole);
            // Reset permissions to role defaults on role change
            user.setPermissions(resolvePermissionsForRole(newRole));
        }

        user = userRepository.save(user);
        log.info("Admin updated user: {} ({})", user.getEmail(), user.getId());
        return UserResponse.from(user);
    }

    // ── Admin: delete user ───────────────────────────────────────────────────

    public void deleteUser(String id) {
        User user = findUserOrThrow(id);
        userRepository.delete(user);
        log.info("Admin deleted user: {} ({})", user.getEmail(), user.getId());
    }

    // ── Admin: toggle user active status ─────────────────────────────────────

    public UserResponse toggleUserStatus(String id) {
        User user = findUserOrThrow(id);
        user.setActive(!user.isActive());
        user = userRepository.save(user);
        log.info("User status toggled: {} -> active={}", user.getEmail(), user.isActive());
        return UserResponse.from(user);
    }

    // ── Profile: get own profile ─────────────────────────────────────────────

    public UserResponse getProfile(String userId) {
        User user = findUserOrThrow(userId);
        return UserResponse.from(user);
    }

    // ── Profile: update own profile ──────────────────────────────────────────

    public UserResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = findUserOrThrow(userId);

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
        if (request.getAddress() != null) user.setAddress(mapAddress(request.getAddress()));

        user = userRepository.save(user);
        return UserResponse.from(user);
    }

    // ── Avatar upload ────────────────────────────────────────────────────────

    public UserResponse updateAvatar(String userId, String avatarUrl) {
        User user = findUserOrThrow(userId);
        user.setAvatar(avatarUrl);
        user = userRepository.save(user);
        return UserResponse.from(user);
    }

    // ── Favourites ───────────────────────────────────────────────────────────

    public List<String> getFavorites(String userId) {
        User user = findUserOrThrow(userId);
        return user.getFavoriteItems();
    }

    public List<String> addFavorite(String userId, String menuItemId) {
        User user = findUserOrThrow(userId);
        if (!user.getFavoriteItems().contains(menuItemId)) {
            user.getFavoriteItems().add(menuItemId);
            userRepository.save(user);
        }
        return user.getFavoriteItems();
    }

    public List<String> removeFavorite(String userId, String menuItemId) {
        User user = findUserOrThrow(userId);
        user.getFavoriteItems().remove(menuItemId);
        userRepository.save(user);
        return user.getFavoriteItems();
    }

    // ── Staff management ─────────────────────────────────────────────────────

    public List<UserResponse> listStaff() {
        return userRepository.findByRoleIn(List.of("staff", "chef", "waiter", "admin")).stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    public UserResponse createStaff(CreateUserRequest request) {
        // Force role to staff if not specified or not a valid staff role
        String role = request.getRole();
        if (role == null || !List.of("staff", "chef", "waiter", "admin").contains(role.toLowerCase())) {
            request.setRole("staff");
        }
        return createUser(request);
    }

    public UserResponse updateStaff(String id, UpdateUserRequest request) {
        return updateUser(id, request);
    }

    public UserResponse updateStaffPermissions(String id, UpdatePermissionsRequest request) {
        User user = findUserOrThrow(id);
        user.setPermissions(request.getPermissions() != null ? request.getPermissions() : new ArrayList<>());
        user = userRepository.save(user);
        log.info("Permissions updated for staff {} ({}): {}", user.getEmail(), user.getId(), user.getPermissions());
        return UserResponse.from(user);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User findUserOrThrow(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private User.Address mapAddress(AddressDto dto) {
        if (dto == null) return new User.Address();
        return User.Address.builder()
                .street(dto.getStreet())
                .city(dto.getCity())
                .state(dto.getState())
                .zipCode(dto.getZipCode())
                .country(dto.getCountry())
                .build();
    }

    static List<String> resolvePermissionsForRole(String role) {
        return switch (role) {
            case "admin"   -> new ArrayList<>(Permissions.ADMIN_PERMISSIONS);
            case "chef"    -> new ArrayList<>(Permissions.CHEF_PERMISSIONS);
            case "waiter"  -> new ArrayList<>(Permissions.WAITER_PERMISSIONS);
            case "staff"   -> new ArrayList<>(Permissions.WAITER_PERMISSIONS); // default staff = waiter perms
            default        -> new ArrayList<>(Permissions.CUSTOMER_PERMISSIONS);
        };
    }
}

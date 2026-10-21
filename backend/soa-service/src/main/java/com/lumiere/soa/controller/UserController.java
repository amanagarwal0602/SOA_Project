package com.lumiere.soa.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lumiere.soa.model.MenuItem;
import com.lumiere.soa.model.User;
import com.lumiere.soa.repository.MenuItemRepository;
import com.lumiere.soa.repository.UserRepository;
import com.lumiere.soa.security.JWTUtility;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public UserController(UserRepository userRepository,
                          MenuItemRepository menuItemRepository,
                          PasswordEncoder passwordEncoder,
                          ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (JWTUtility.validateToken(token)) {
                String username = JWTUtility.getUsername(token);
                Optional<User> opt = userRepository.findByUsernameIgnoreCase(username);
                if (opt.isEmpty()) {
                    opt = userRepository.findByEmailIgnoreCase(username);
                }
                if (opt.isPresent()) return opt.get();
            }
        }
        return null;
    }

    @GetMapping({"/api/users", "/api/admin/users"})
    public ResponseEntity<?> getUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(Map.of("data", Map.of("users", users)));
    }

    @PostMapping("/api/admin/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (user.getId() == null || user.getId().isBlank()) {
            user.setId("user_" + System.currentTimeMillis());
        }
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PutMapping({"/api/users/profile", "/users/profile"})
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                           @RequestBody Map<String, Object> body) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) {
            String email = (String) body.get("email");
            if (email != null && !email.isBlank()) {
                Optional<User> opt = userRepository.findByEmailIgnoreCase(email);
                if (opt.isPresent()) user = opt.get();
            }
        }

        if (user == null) {
            List<User> all = userRepository.findAll();
            if (!all.isEmpty()) user = all.get(0);
        }

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
        }

        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("phone")) user.setPhone((String) body.get("phone"));

        Object addressObj = body.get("address");
        if (addressObj instanceof Map<?, ?> addr) {
            if (addr.get("street") != null) user.setAddressStreet(addr.get("street").toString());
            if (addr.get("city") != null) user.setAddressCity(addr.get("city").toString());
            if (addr.get("state") != null) user.setAddressState(addr.get("state").toString());
            if (addr.get("zipCode") != null) {
                user.setAddressZipcode(addr.get("zipCode").toString());
            } else if (addr.get("zipcode") != null) {
                user.setAddressZipcode(addr.get("zipcode").toString());
            }
            if (addr.get("country") != null) user.setAddressCountry(addr.get("country").toString());
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of("data", saved, "success", true));
    }

    @PutMapping("/api/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        Optional<User> opt = userRepository.findById(id);
        User existing;
        if (opt.isEmpty()) {
            existing = User.builder().id(id).build();
        } else {
            existing = opt.get();
        }

        if (updates.containsKey("name")) existing.setName((String) updates.get("name"));
        if (updates.containsKey("phone")) existing.setPhone((String) updates.get("phone"));
        if (updates.containsKey("avatar")) existing.setAvatar((String) updates.get("avatar"));
        if (updates.containsKey("role")) existing.setRole((String) updates.get("role"));
        if (updates.containsKey("address_street")) existing.setAddressStreet((String) updates.get("address_street"));
        if (updates.containsKey("address_city")) existing.setAddressCity((String) updates.get("address_city"));
        if (updates.containsKey("address_state")) existing.setAddressState((String) updates.get("address_state"));
        if (updates.containsKey("address_zipcode")) existing.setAddressZipcode((String) updates.get("address_zipcode"));
        if (updates.containsKey("address_country")) existing.setAddressCountry((String) updates.get("address_country"));

        if (updates.containsKey("password")) {
            String raw = (String) updates.get("password");
            if (raw != null && !raw.isBlank()) {
                existing.setPassword(passwordEncoder.encode(raw));
            }
        }

        if (updates.containsKey("is_active")) {
            existing.setActive(Boolean.parseBoolean(updates.get("is_active").toString()));
        } else if (updates.containsKey("isActive")) {
            existing.setActive(Boolean.parseBoolean(updates.get("isActive").toString()));
        }

        if (updates.containsKey("permissions")) {
            Object p = updates.get("permissions");
            if (p instanceof String) {
                existing.setPermissions((String) p);
            } else {
                try {
                    existing.setPermissions(objectMapper.writeValueAsString(p));
                } catch (Exception ignored) {}
            }
        }

        if (updates.containsKey("favorite_items") || updates.containsKey("favoriteItems")) {
            Object fav = updates.getOrDefault("favorite_items", updates.get("favoriteItems"));
            if (fav instanceof String) {
                existing.setFavoriteItems((String) fav);
            } else {
                try {
                    existing.setFavoriteItems(objectMapper.writeValueAsString(fav));
                } catch (Exception ignored) {}
            }
        }

        User saved = userRepository.save(existing);
        return ResponseEntity.ok(Map.of("data", saved, "success", true));
    }

    @DeleteMapping("/api/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("data", Map.of("id", id, "deleted", true)));
    }

    // --- Favorites Endpoints ---

    @GetMapping({"/api/users/favorites", "/users/favorites"})
    public ResponseEntity<?> getFavorites(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        List<String> favIds = new ArrayList<>();
        if (user != null && user.getFavoriteItems() != null && !user.getFavoriteItems().isBlank()) {
            try {
                favIds = objectMapper.readValue(user.getFavoriteItems(), new TypeReference<List<String>>() {});
            } catch (Exception ignored) {}
        }

        List<MenuItem> items;
        if (!favIds.isEmpty()) {
            items = menuItemRepository.findAllById(favIds);
        } else {
            // Default favorite items (popular)
            items = menuItemRepository.findByShowOnHomepageTrue();
            if (items.isEmpty()) {
                items = menuItemRepository.findAll().stream().limit(3).toList();
            }
        }
        return ResponseEntity.ok(Map.of("data", items));
    }

    @PostMapping({"/api/users/favorites/{itemId}", "/users/favorites/{itemId}"})
    public ResponseEntity<?> addFavorite(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                         @PathVariable String itemId) {
        User user = getAuthenticatedUser(authHeader);
        if (user != null) {
            List<String> favIds = new ArrayList<>();
            if (user.getFavoriteItems() != null && !user.getFavoriteItems().isBlank()) {
                try {
                    favIds = objectMapper.readValue(user.getFavoriteItems(), new TypeReference<List<String>>() {});
                } catch (Exception ignored) {}
            }
            if (!favIds.contains(itemId)) {
                favIds.add(itemId);
                try {
                    user.setFavoriteItems(objectMapper.writeValueAsString(favIds));
                    userRepository.save(user);
                } catch (Exception ignored) {}
            }
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Added to favorites"));
    }

    @DeleteMapping({"/api/users/favorites/{itemId}", "/users/favorites/{itemId}"})
    public ResponseEntity<?> removeFavorite(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                            @PathVariable String itemId) {
        User user = getAuthenticatedUser(authHeader);
        if (user != null) {
            List<String> favIds = new ArrayList<>();
            if (user.getFavoriteItems() != null && !user.getFavoriteItems().isBlank()) {
                try {
                    favIds = objectMapper.readValue(user.getFavoriteItems(), new TypeReference<List<String>>() {});
                } catch (Exception ignored) {}
            }
            favIds.remove(itemId);
            try {
                user.setFavoriteItems(objectMapper.writeValueAsString(favIds));
                userRepository.save(user);
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Removed from favorites"));
    }
}

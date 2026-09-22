package com.lumiere.common.security;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Authenticated principal carried through the security context.
 * Populated by each service's JwtRequestFilter from the validated JWT.
 */
@Data
@Builder
public class UserPrincipal {

    private String       id;
    private String       email;
    private String       role;
    private List<String> permissions;

    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(role);
    }

    /**
     * Checks whether the principal holds a specific permission.
     * Admin role implicitly holds every permission.
     */
    public boolean hasPermission(String permission) {
        if (isAdmin()) return true;
        return permissions != null && permissions.contains(permission);
    }

    public boolean hasAnyPermission(String... perms) {
        for (String p : perms) {
            if (hasPermission(p)) return true;
        }
        return false;
    }
}

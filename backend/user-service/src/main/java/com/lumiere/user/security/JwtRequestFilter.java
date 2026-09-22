package com.lumiere.user.security;

import com.lumiere.common.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Per-request JWT authentication filter for user-service internal endpoints.
 *
 * NOTE: The gateway already validates JWT and forwards X-User-Id / X-User-Role / X-User-Permissions
 * headers. However, user-service also serves auth endpoints (login/signup) where we need to issue
 * tokens, and for internal consistency, some endpoints validate the Bearer token directly.
 *
 * This filter:
 * 1. Extracts Bearer token from Authorization header
 * 2. Validates signature + expiry via JwtUtil
 * 3. Sets SecurityContext with userId as principal and permissions as authorities
 * 4. Falls through silently if no token present (public endpoints handled by SecurityConfig rules)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractToken(request);
            if (token != null && jwtUtil.isTokenValid(token)) {
                Claims claims = jwtUtil.validateAndExtractClaims(token);
                String userId = claims.getSubject();
                String role = claims.get("role", String.class);

                @SuppressWarnings("unchecked")
                List<String> permissions = claims.get("permissions", List.class);

                // Build authorities: ROLE_<role> + each permission string
                List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                if (role != null) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
                }
                if (permissions != null) {
                    authorities.addAll(
                        permissions.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList())
                    );
                }

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                // Also check gateway-forwarded headers as fallback
                String gatewayUserId = request.getHeader("X-User-Id");
                if (StringUtils.hasText(gatewayUserId)) {
                    String gatewayRole = request.getHeader("X-User-Role");
                    String gatewayPerms = request.getHeader("X-User-Permissions");

                    List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                    if (StringUtils.hasText(gatewayRole)) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + gatewayRole.toUpperCase()));
                    }
                    if (StringUtils.hasText(gatewayPerms)) {
                        for (String perm : gatewayPerms.split(",")) {
                            if (StringUtils.hasText(perm.trim())) {
                                authorities.add(new SimpleGrantedAuthority(perm.trim()));
                            }
                        }
                    }

                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(gatewayUserId, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            log.debug("JWT authentication failed: {}", ex.getMessage());
            // Don't set context — endpoint will be handled by SecurityConfig (401 or public)
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}

package com.lumiere.order.config;

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
import java.util.ArrayList;
import java.util.List;

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
                setAuth(claims.getSubject(), claims.get("role", String.class),
                        claims.get("permissions", List.class), request);
            } else {
                String uid = request.getHeader("X-User-Id");
                if (StringUtils.hasText(uid)) {
                    String role = request.getHeader("X-User-Role");
                    String perms = request.getHeader("X-User-Permissions");
                    List<String> permList = new ArrayList<>();
                    if (StringUtils.hasText(perms)) {
                        for (String p : perms.split(",")) {
                            if (!p.trim().isEmpty()) permList.add(p.trim());
                        }
                    }
                    setAuth(uid, role, permList, request);
                }
            }
        } catch (Exception ex) {
            log.debug("JWT auth failed: {}", ex.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private void setAuth(String userId, String role, List<?> permissions, HttpServletRequest request) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        if (role != null) authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        if (permissions != null) {
            permissions.forEach(p -> authorities.add(new SimpleGrantedAuthority(p.toString())));
        }
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userId, null, authorities);
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private String extractToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) return bearer.substring(7);
        return null;
    }
}

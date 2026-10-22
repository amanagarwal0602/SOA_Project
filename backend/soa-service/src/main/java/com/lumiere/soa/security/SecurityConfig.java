package com.lumiere.soa.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Skill 5: Securing APIs with CORS
 * Skill 7: Securing Library / Food Service with JWT (RBAC)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(frame -> frame.disable())) // For H2 Web Console
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Skill 3 & 4: Auth & Registration endpoints
                .requestMatchers("/api/auth/**", "/signup", "/login", "/validate", "/user", "/message").permitAll()
                // Public content endpoints
                .requestMatchers("/api/menu/**", "/api/todays-offers/**", "/api/hero/**", "/api/about/**").permitAll()
                .requestMatchers("/api/contact-info/**", "/api/gallery/**", "/api/reviews/**", "/api/features/**").permitAll()
                .requestMatchers("/api/team/**", "/api/site-settings/**", "/api/seo/**", "/api/coupons/**").permitAll()
                .requestMatchers("/api/orders/**", "/api/reservations/**", "/api/users/**", "/api/admin/**").permitAll()
                // Skill 6 & 7: Library Management with RBAC
                .requestMatchers("/books/**", "/rbc/user/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/rbc/books/**").hasAnyRole("ADMIN", "USER", "CUSTOMER")
                .requestMatchers(HttpMethod.POST, "/rbc/books/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/rbc/books/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/rbc/books/**").hasRole("ADMIN")
                // H2 console & Actuator & Health & Live Database Inspector
                .requestMatchers("/", "/db", "/database", "/tables", "/api/db/**", "/api/database/**", "/h2-console/**", "/actuator/**", "/error", "/health", "/api/health").permitAll()
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(Arrays.asList("Access-Control-Allow-Origin", "Access-Control-Allow-Credentials", "Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

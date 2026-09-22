package com.lumiere.order.config;

import com.lumiere.common.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiry-ms:" + JwtUtil.DEFAULT_ACCESS_TOKEN_EXPIRY_MS + "}")
    private long accessTokenExpiryMs;

    @Value("${jwt.refresh-token-expiry-ms:" + JwtUtil.DEFAULT_REFRESH_TOKEN_EXPIRY_MS + "}")
    private long refreshTokenExpiryMs;

    @Bean
    public JwtUtil jwtUtil() {
        return new JwtUtil(jwtSecret, accessTokenExpiryMs, refreshTokenExpiryMs);
    }
}

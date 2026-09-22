package com.lumiere.menu.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Enables Spring Cache abstraction — backed by Caffeine (configured in application.yml).
 */
@Configuration
@EnableCaching
public class CacheConfig {
}

package com.lumiere.user.config;

import com.lumiere.common.security.Permissions;
import com.lumiere.user.model.User;
import com.lumiere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

/**
 * Seeds admin and demo accounts on application startup if they don't already exist.
 *
 * Admin: admin@lumiere.com / admin123    (role: admin, all 42 permissions)
 * Demo:  demo@lumiere.com  / demo123     (role: customer)
 *
 * Runs once per startup — idempotent via email uniqueness check.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        seedAdmin();
        seedDemo();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmailIgnoreCase("admin@lumiere.com")) {
            log.info("Admin account already exists — skipping seed");
            return;
        }

        User admin = User.builder()
                .name("Admin")
                .email("admin@lumiere.com")
                .username("admin")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role("admin")
                .permissions(new ArrayList<>(Permissions.ADMIN_PERMISSIONS))
                .active(true)
                .emailVerified(true)
                .build();

        userRepository.save(admin);
        log.info("✓ Seeded admin account: admin@lumiere.com / admin123");
    }

    private void seedDemo() {
        if (userRepository.existsByEmailIgnoreCase("demo@lumiere.com")) {
            log.info("Demo account already exists — skipping seed");
            return;
        }

        User demo = User.builder()
                .name("Demo Customer")
                .email("demo@lumiere.com")
                .username("demo")
                .passwordHash(passwordEncoder.encode("demo123"))
                .phone("+1-555-0100")
                .role("customer")
                .permissions(new ArrayList<>(Permissions.CUSTOMER_PERMISSIONS))
                .active(true)
                .emailVerified(true)
                .address(User.Address.builder()
                        .street("123 Demo Street")
                        .city("San Francisco")
                        .state("CA")
                        .zipCode("94102")
                        .country("US")
                        .build())
                .build();

        userRepository.save(demo);
        log.info("✓ Seeded demo account: demo@lumiere.com / demo123");
    }
}

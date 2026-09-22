package com.lumiere.user.repository;

import com.lumiere.user.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    /**
     * Used for login: caller passes the same value for both parameters.
     * Spring Data generates an OR query: WHERE email = ? OR username = ?
     */
    Optional<User> findByEmailIgnoreCaseOrUsernameIgnoreCase(String email, String username);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    List<User> findByRole(String role);

    List<User> findByRoleIn(List<String> roles);

    List<User> findByActiveTrue();
}

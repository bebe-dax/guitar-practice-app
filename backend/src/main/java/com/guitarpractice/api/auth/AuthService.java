package com.guitarpractice.api.auth;

import com.guitarpractice.api.user.User;
import com.guitarpractice.api.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException();
        }
        User user = User.create(email, passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    public User login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return user;
    }
}

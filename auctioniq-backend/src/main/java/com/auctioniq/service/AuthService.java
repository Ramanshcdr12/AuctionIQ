package com.auctioniq.service;

import com.auctioniq.dto.AuthRequest;
import com.auctioniq.dto.AuthResponse;
import com.auctioniq.dto.RegisterRequest;
import com.auctioniq.entity.User;
import com.auctioniq.repository.UserRepository;
import com.auctioniq.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User(
            request.username(),
            passwordEncoder.encode(request.password()),
            request.email(),
            "ROLE_USER",
            request.favoriteTeam() != null ? request.favoriteTeam() : "Unspecified"
        );

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole(), user.getFavoriteTeam());
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        User user = userRepository.findByUsername(request.username())
            .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole(), user.getFavoriteTeam());
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    @Transactional
    public User updateProfile(String username, String email, String favoriteTeam) {
        User user = getUserByUsername(username);
        
        if (email != null && !email.trim().isEmpty() && !email.equals(user.getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email is already registered by another user");
            }
            user.setEmail(email);
        }
        
        if (favoriteTeam != null) {
            user.setFavoriteTeam(favoriteTeam);
        }
        
        return userRepository.save(user);
    }
}

package com.auctioniq.controller;

import com.auctioniq.dto.AuthRequest;
import com.auctioniq.dto.AuthResponse;
import com.auctioniq.dto.RegisterRequest;
import com.auctioniq.entity.User;
import com.auctioniq.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        return ResponseEntity.ok(authService.getUserByUsername(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            Authentication authentication,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String favoriteTeam) {
        return ResponseEntity.ok(authService.updateProfile(authentication.getName(), email, favoriteTeam));
    }
}

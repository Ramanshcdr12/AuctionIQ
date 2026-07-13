package com.auctioniq.dto;

public record AuthResponse(
    String token,
    String username,
    String email,
    String role,
    String favoriteTeam
) {}

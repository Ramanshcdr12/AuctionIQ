package com.auctioniq.dto;

public record PlayerDTO(
    Long id,
    String name,
    String role,
    String battingStyle,
    String bowlingStyle,
    String country,
    String iplTeam,
    Double basePrice,
    Double soldPrice,
    Integer matchesPlayed,
    Integer runsScored,
    Double battingAverage,
    Double strikeRate,
    Integer wicketsTaken,
    Double bowlingAverage,
    Double economyRate,
    Double oversBowled,
    Double rating
) {}

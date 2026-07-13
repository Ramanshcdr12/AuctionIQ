package com.auctioniq.dto;

import java.time.LocalDateTime;

public record SavedReportDTO(
    Long id,
    PlayerDTO player,
    String reportContent,
    LocalDateTime generatedAt
) {}

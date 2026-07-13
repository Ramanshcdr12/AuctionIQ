package com.auctioniq.dto;

import jakarta.validation.constraints.NotNull;

public record ReportRequest(
    @NotNull(message = "Player ID is required")
    Long playerId
) {}

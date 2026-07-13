package com.auctioniq.mapper;

import com.auctioniq.entity.Player;
import com.auctioniq.dto.PlayerDTO;

public class PlayerMapper {

    public static PlayerDTO toDTO(Player player) {
        if (player == null) return null;
        return new PlayerDTO(
            player.getId(),
            player.getName(),
            player.getRole(),
            player.getBattingStyle(),
            player.getBowlingStyle(),
            player.getCountry(),
            player.getIplTeam(),
            player.getBasePrice(),
            player.getSoldPrice(),
            player.getMatchesPlayed(),
            player.getRunsScored(),
            player.getBattingAverage(),
            player.getStrikeRate(),
            player.getWicketsTaken(),
            player.getBowlingAverage(),
            player.getEconomyRate(),
            player.getOversBowled(),
            player.getRating()
        );
    }

    public static Player toEntity(PlayerDTO dto) {
        if (dto == null) return null;
        Player player = new Player();
        player.setId(dto.id());
        player.setName(dto.name());
        player.setRole(dto.role());
        player.setBattingStyle(dto.battingStyle());
        player.setBowlingStyle(dto.bowlingStyle());
        player.setCountry(dto.country());
        player.setIplTeam(dto.iplTeam());
        player.setBasePrice(dto.basePrice());
        player.setSoldPrice(dto.soldPrice());
        player.setMatchesPlayed(dto.matchesPlayed());
        player.setRunsScored(dto.runsScored());
        player.setBattingAverage(dto.battingAverage());
        player.setStrikeRate(dto.strikeRate());
        player.setWicketsTaken(dto.wicketsTaken());
        player.setBowlingAverage(dto.bowlingAverage());
        player.setEconomyRate(dto.economyRate());
        player.setOversBowled(dto.oversBowled());
        player.setRating(dto.rating());
        return player;
    }
}

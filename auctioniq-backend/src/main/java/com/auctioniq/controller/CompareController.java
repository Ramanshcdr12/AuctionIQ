package com.auctioniq.controller;

import com.auctioniq.dto.PlayerDTO;
import com.auctioniq.mapper.PlayerMapper;
import com.auctioniq.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/compare")
public class CompareController {

    private final PlayerService playerService;

    public CompareController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<List<PlayerDTO>> comparePlayers(
            @RequestParam Long player1Id,
            @RequestParam Long player2Id) {
        
        PlayerDTO p1 = PlayerMapper.toDTO(playerService.getPlayerById(player1Id));
        PlayerDTO p2 = PlayerMapper.toDTO(playerService.getPlayerById(player2Id));
        
        return ResponseEntity.ok(List.of(p1, p2));
    }
}

package com.auctioniq.controller;

import com.auctioniq.dto.PlayerDTO;
import com.auctioniq.mapper.PlayerMapper;
import com.auctioniq.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<List<PlayerDTO>> getPlayers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String team,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String country) {
        
        List<PlayerDTO> players = playerService.searchPlayers(name, team, role, country).stream()
                .map(PlayerMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(players);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerDTO> getPlayerById(@PathVariable Long id) {
        return ResponseEntity.ok(PlayerMapper.toDTO(playerService.getPlayerById(id)));
    }

    @GetMapping("/meta/teams")
    public ResponseEntity<List<String>> getTeams() {
        return ResponseEntity.ok(playerService.getAllUniqueTeams());
    }

    @GetMapping("/meta/roles")
    public ResponseEntity<List<String>> getRoles() {
        return ResponseEntity.ok(playerService.getAllUniqueRoles());
    }

    @GetMapping("/meta/countries")
    public ResponseEntity<List<String>> getCountries() {
        return ResponseEntity.ok(playerService.getAllUniqueCountries());
    }
}

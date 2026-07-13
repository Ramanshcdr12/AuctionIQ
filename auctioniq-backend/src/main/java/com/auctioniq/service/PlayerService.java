package com.auctioniq.service;

import com.auctioniq.entity.Player;
import com.auctioniq.exception.ResourceNotFoundException;
import com.auctioniq.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;

    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public Player getPlayerById(Long id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with ID: " + id));
    }

    public List<Player> searchPlayers(String name, String team, String role, String country) {
        List<Player> players = playerRepository.findAll();

        return players.stream()
                .filter(p -> name == null || name.trim().isEmpty() || p.getName().toLowerCase().contains(name.toLowerCase().trim()))
                .filter(p -> team == null || team.trim().isEmpty() || p.getIplTeam().equalsIgnoreCase(team.trim()))
                .filter(p -> role == null || role.trim().isEmpty() || p.getRole().equalsIgnoreCase(role.trim()))
                .filter(p -> country == null || country.trim().isEmpty() || p.getCountry().equalsIgnoreCase(country.trim()))
                .collect(Collectors.toList());
    }

    public List<String> getAllUniqueTeams() {
        return playerRepository.findAll().stream()
                .map(Player::getIplTeam)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> getAllUniqueRoles() {
        return playerRepository.findAll().stream()
                .map(Player::getRole)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> getAllUniqueCountries() {
        return playerRepository.findAll().stream()
                .map(Player::getCountry)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}

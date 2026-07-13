package com.auctioniq.service;

import com.auctioniq.entity.Player;
import com.auctioniq.repository.PlayerRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;

@Service
public class DatabaseInitializerService implements CommandLineRunner {

    private final PlayerRepository playerRepository;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    public DatabaseInitializerService(PlayerRepository playerRepository, ResourceLoader resourceLoader) {
        this.playerRepository = playerRepository;
        this.resourceLoader = resourceLoader;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public void run(String... args) throws Exception {
        if (playerRepository.count() == 0) {
            System.out.println("Initializing database with 100 IPL players...");
            Resource resource = resourceLoader.getResource("classpath:players.json");
            try (InputStream inputStream = resource.getInputStream()) {
                List<Player> players = objectMapper.readValue(inputStream, new TypeReference<List<Player>>() {});
                playerRepository.saveAll(players);
                System.out.println("Successfully seeded " + players.size() + " players into the database.");
            } catch (Exception e) {
                System.err.println("Failed to initialize player database: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("Database already contains " + playerRepository.count() + " players. Skipping initialization.");
        }
    }
}

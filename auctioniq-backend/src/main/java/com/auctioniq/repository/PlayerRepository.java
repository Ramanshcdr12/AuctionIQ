package com.auctioniq.repository;

import com.auctioniq.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    List<Player> findByIplTeamIgnoreCase(String iplTeam);
    List<Player> findByRoleIgnoreCase(String role);
    List<Player> findByCountryIgnoreCase(String country);
    List<Player> findByNameContainingIgnoreCase(String name);
}

package com.auctioniq.repository;

import com.auctioniq.entity.SavedReport;
import com.auctioniq.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavedReportRepository extends JpaRepository<SavedReport, Long> {
    List<SavedReport> findByUserOrderByGeneratedAtDesc(User user);
    Optional<SavedReport> findByUserAndPlayerId(User user, Long playerId);
    boolean existsByUserAndPlayerId(User user, Long playerId);
}

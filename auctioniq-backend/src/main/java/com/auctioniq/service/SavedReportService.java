package com.auctioniq.service;

import com.auctioniq.entity.Player;
import com.auctioniq.entity.SavedReport;
import com.auctioniq.entity.User;
import com.auctioniq.exception.ResourceNotFoundException;
import com.auctioniq.exception.UnauthorizedException;
import com.auctioniq.repository.SavedReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SavedReportService {

    private final SavedReportRepository savedReportRepository;

    public SavedReportService(SavedReportRepository savedReportRepository) {
        this.savedReportRepository = savedReportRepository;
    }

    @Transactional
    public SavedReport saveReport(User user, Player player, String reportContent) {
        SavedReport report = savedReportRepository.findByUserAndPlayerId(user, player.getId())
                .orElse(new SavedReport());

        report.setUser(user);
        report.setPlayer(player);
        report.setReportContent(reportContent);
        report.setGeneratedAt(LocalDateTime.now());

        return savedReportRepository.save(report);
    }

    public List<SavedReport> getSavedReportsForUser(User user) {
        return savedReportRepository.findByUserOrderByGeneratedAtDesc(user);
    }

    public SavedReport getReportById(Long id, User user) {
        SavedReport report = savedReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Saved report not found with ID: " + id));

        if (!report.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to view this report");
        }

        return report;
    }

    @Transactional
    public void deleteReport(Long id, User user) {
        SavedReport report = savedReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Saved report not found with ID: " + id));

        if (!report.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this report");
        }

        savedReportRepository.delete(report);
    }
}

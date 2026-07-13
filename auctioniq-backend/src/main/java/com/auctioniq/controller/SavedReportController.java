package com.auctioniq.controller;

import com.auctioniq.dto.SavedReportDTO;
import com.auctioniq.entity.User;
import com.auctioniq.mapper.ReportMapper;
import com.auctioniq.service.AuthService;
import com.auctioniq.service.SavedReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saved-reports")
public class SavedReportController {

    private final SavedReportService savedReportService;
    private final AuthService authService;

    public SavedReportController(SavedReportService savedReportService, AuthService authService) {
        this.savedReportService = savedReportService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<SavedReportDTO>> getSavedReports(Authentication authentication) {
        User user = authService.getUserByUsername(authentication.getName());
        List<SavedReportDTO> reports = savedReportService.getSavedReportsForUser(user).stream()
                .map(ReportMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavedReportDTO> getSavedReportById(
            Authentication authentication,
            @PathVariable Long id) {
        User user = authService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(ReportMapper.toDTO(savedReportService.getReportById(id, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSavedReport(
            Authentication authentication,
            @PathVariable Long id) {
        User user = authService.getUserByUsername(authentication.getName());
        savedReportService.deleteReport(id, user);
        return ResponseEntity.noContent().build();
    }
}

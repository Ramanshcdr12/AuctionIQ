package com.auctioniq.controller;

import com.auctioniq.dto.ChatRequest;
import com.auctioniq.dto.ChatResponse;
import com.auctioniq.dto.ReportRequest;
import com.auctioniq.entity.Player;
import com.auctioniq.entity.User;
import com.auctioniq.service.AuthService;
import com.auctioniq.service.GeminiService;
import com.auctioniq.service.PlayerService;
import com.auctioniq.service.SavedReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;
    private final PlayerService playerService;
    private final SavedReportService savedReportService;
    private final AuthService authService;

    public AiController(GeminiService geminiService, PlayerService playerService,
                        SavedReportService savedReportService, AuthService authService) {
        this.geminiService = geminiService;
        this.playerService = playerService;
        this.savedReportService = savedReportService;
        this.authService = authService;
    }

    @PostMapping("/report")
    public ResponseEntity<String> generateReport(
            Authentication authentication,
            @Valid @RequestBody ReportRequest request) {
        
        Player player = playerService.getPlayerById(request.playerId());
        User user = authService.getUserByUsername(authentication.getName());
        
        String reportJson = geminiService.generateScoutingReport(player);
        savedReportService.saveReport(user, player, reportJson);
        
        return ResponseEntity.ok(reportJson);
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        String answer = geminiService.chat(request.message());
        return ResponseEntity.ok(new ChatResponse(answer));
    }
}

package com.auctioniq.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_reports")
public class SavedReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @Lob
    @Column(name = "report_content", nullable = false, columnDefinition = "TEXT")
    private String reportContent; // Holds the AI generated JSON report

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    public SavedReport() {}

    public SavedReport(User user, Player player, String reportContent, LocalDateTime generatedAt) {
        this.user = user;
        this.player = player;
        this.reportContent = reportContent;
        this.generatedAt = generatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public String getReportContent() {
        return reportContent;
    }

    public void setReportContent(String reportContent) {
        this.reportContent = reportContent;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}

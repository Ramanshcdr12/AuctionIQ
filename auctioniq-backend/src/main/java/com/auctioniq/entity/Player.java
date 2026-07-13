package com.auctioniq.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "players")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String role; // e.g. Batsman, Bowler, All-Rounder, Wicketkeeper-Batsman

    @Column(name = "batting_style", length = 50)
    private String battingStyle; // e.g. Right-hand bat, Left-hand bat

    @Column(name = "bowling_style", length = 50)
    private String bowlingStyle; // e.g. Right-arm fast, N/A

    @Column(nullable = false, length = 50)
    private String country;

    @Column(name = "ipl_team", length = 50)
    private String iplTeam; // Current IPL Team

    @Column(name = "base_price", nullable = false)
    private Double basePrice; // Base price in Crores

    @Column(name = "sold_price")
    private Double soldPrice; // Sold price in Crores

    @Column(name = "matches_played")
    private Integer matchesPlayed;

    @Column(name = "runs_scored")
    private Integer runsScored;

    @Column(name = "batting_average")
    private Double battingAverage;

    @Column(name = "strike_rate")
    private Double strikeRate;

    @Column(name = "wickets_taken")
    private Integer wicketsTaken;

    @Column(name = "bowling_average")
    private Double bowlingAverage;

    @Column(name = "economy_rate")
    private Double economyRate;

    @Column(name = "overs_bowled")
    private Double oversBowled;

    @Column(nullable = false)
    private Double rating; // Overall player rating (out of 10.0)

    public Player() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getBattingStyle() {
        return battingStyle;
    }

    public void setBattingStyle(String battingStyle) {
        this.battingStyle = battingStyle;
    }

    public String getBowlingStyle() {
        return bowlingStyle;
    }

    public void setBowlingStyle(String bowlingStyle) {
        this.bowlingStyle = bowlingStyle;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getIplTeam() {
        return iplTeam;
    }

    public void setIplTeam(String iplTeam) {
        this.iplTeam = iplTeam;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public Double getSoldPrice() {
        return soldPrice;
    }

    public void setSoldPrice(Double soldPrice) {
        this.soldPrice = soldPrice;
    }

    public Integer getMatchesPlayed() {
        return matchesPlayed;
    }

    public void setMatchesPlayed(Integer matchesPlayed) {
        this.matchesPlayed = matchesPlayed;
    }

    public Integer getRunsScored() {
        return runsScored;
    }

    public void setRunsScored(Integer runsScored) {
        this.runsScored = runsScored;
    }

    public Double getBattingAverage() {
        return battingAverage;
    }

    public void setBattingAverage(Double battingAverage) {
        this.battingAverage = battingAverage;
    }

    public Double getStrikeRate() {
        return strikeRate;
    }

    public void setStrikeRate(Double strikeRate) {
        this.strikeRate = strikeRate;
    }

    public Integer getWicketsTaken() {
        return wicketsTaken;
    }

    public void setWicketsTaken(Integer wicketsTaken) {
        this.wicketsTaken = wicketsTaken;
    }

    public Double getBowlingAverage() {
        return bowlingAverage;
    }

    public void setBowlingAverage(Double bowlingAverage) {
        this.bowlingAverage = bowlingAverage;
    }

    public Double getEconomyRate() {
        return economyRate;
    }

    public void setEconomyRate(Double economyRate) {
        this.economyRate = economyRate;
    }

    public Double getOversBowled() {
        return oversBowled;
    }

    public void setOversBowled(Double oversBowled) {
        this.oversBowled = oversBowled;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}

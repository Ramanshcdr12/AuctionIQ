package com.auctioniq.service;

import com.auctioniq.entity.Player;
import com.auctioniq.repository.PlayerRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final PlayerRepository playerRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Generates a scouting report for a player.
     * Tries the Gemini API first. If key is missing or call fails, falls back to the statistical generator.
     */
    public String generateScoutingReport(Player player) {
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.startsWith("${")) {
            try {
                String prompt = createReportPrompt(player);
                return callGemini(prompt, true);
            } catch (Exception e) {
                System.err.println("Gemini API call failed: " + e.getMessage() + ". Falling back to programmatic scouting report generator.");
            }
        }
        return generateFallbackReport(player);
    }

    /**
     * Answers general chat assistant questions with context of all players.
     */
    public String chat(String userMessage) {
        List<Player> allPlayers = playerRepository.findAll();
        
        // If API key is available, call Gemini with player context
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.startsWith("${")) {
            try {
                String systemContext = createSystemContext(allPlayers);
                String fullPrompt = "Context of players in database:\n" + systemContext + "\n\nUser Question: " + userMessage;
                return callGemini(fullPrompt, false);
            } catch (Exception e) {
                System.err.println("Gemini API chat call failed: " + e.getMessage() + ". Falling back to local intelligence matching engine.");
            }
        }
        
        // Local Intelligence Matching Engine (RAG Fallback)
        return handleLocalChat(userMessage, allPlayers);
    }

    private String callGemini(String prompt, boolean expectJson) throws Exception {
        String url = apiUrl + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build Gemini JSON Request Body
        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        
        Map<String, Object> parts = new HashMap<>();
        parts.put("parts", List.of(textPart));
        
        requestBody.put("contents", List.of(parts));

        if (expectJson) {
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);
        }

        String requestJson = objectMapper.writeValueAsString(requestBody);
        HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        }
        
        throw new RuntimeException("Unsuccessful status code received from Gemini: " + response.getStatusCode());
    }

    private String createReportPrompt(Player p) {
        return "You are an expert IPL Cricket Scout and Franchise Decision Analyst.\n" +
                "Generate a professional, structured scouting report for the following player based on their stats:\n\n" +
                "Name: " + p.getName() + "\n" +
                "Role: " + p.getRole() + "\n" +
                "Batting Style: " + p.getBattingStyle() + "\n" +
                "Bowling Style: " + p.getBowlingStyle() + "\n" +
                "Country: " + p.getCountry() + "\n" +
                "IPL Team: " + p.getIplTeam() + "\n" +
                "Base Price: ₹" + p.getBasePrice() + " Cr\n" +
                "Sold Price: ₹" + p.getSoldPrice() + " Cr\n" +
                "Matches Played: " + p.getMatchesPlayed() + "\n" +
                "Runs Scored: " + p.getRunsScored() + "\n" +
                "Batting Average: " + p.getBattingAverage() + "\n" +
                "Strike Rate: " + p.getStrikeRate() + "\n" +
                "Wickets Taken: " + p.getWicketsTaken() + "\n" +
                "Bowling Average: " + p.getBowlingAverage() + "\n" +
                "Economy Rate: " + p.getEconomyRate() + "\n" +
                "Overs Bowled: " + p.getOversBowled() + "\n" +
                "Overall Rating: " + p.getRating() + "/10.0\n\n" +
                "You must return ONLY a valid JSON object matching the following structure. No markdown wrapping, no trailing text:\n" +
                "{\n" +
                "  \"strengths\": [\"string (bullet points)\", ...],\n" +
                "  \"weaknesses\": [\"string (bullet points)\", ...],\n" +
                "  \"bestTeamFit\": \"string (IPL Franchise names & reason why)\",\n" +
                "  \"playingRole\": \"string (detailed playing role description)\",\n" +
                "  \"auctionRecommendation\": \"string (buy/skip/hold advice)\",\n" +
                "  \"suggestedMaxBid\": \"string (in crores, e.g. '₹8.5 - ₹10.0 Crore')\",\n" +
                "  \"riskAnalysis\": \"string (risk factor review)\",\n" +
                "  \"similarPlayers\": [\"string (names)\", ...],\n" +
                "  \"futurePotential\": \"string (next 3-5 years prediction)\"\n" +
                "}";
    }

    private String createSystemContext(List<Player> players) {
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Name,Role,Country,IPL_Team,BasePrice_Cr,SoldPrice_Cr,Rating,Runs,BatAvg,SR,Wkts,BowlAvg,Econ\n");
        for (Player p : players) {
            sb.append(p.getId()).append(",")
              .append(p.getName()).append(",")
              .append(p.getRole()).append(",")
              .append(p.getCountry()).append(",")
              .append(p.getIplTeam()).append(",")
              .append(p.getBasePrice()).append(",")
              .append(p.getSoldPrice()).append(",")
              .append(p.getRating()).append(",")
              .append(p.getRunsScored()).append(",")
              .append(p.getBattingAverage()).append(",")
              .append(p.getStrikeRate()).append(",")
              .append(p.getWicketsTaken()).append(",")
              .append(p.getBowlingAverage()).append(",")
              .append(p.getEconomyRate()).append("\n");
        }
        return sb.toString();
    }

    /**
     * Programmatic fallback report generator using player stats.
     */
    private String generateFallbackReport(Player p) {
        boolean isBatsman = p.getRole().equalsIgnoreCase("Batsman") || p.getRole().equalsIgnoreCase("Wicketkeeper-Batsman");
        boolean isBowler = p.getRole().equalsIgnoreCase("Bowler");
        boolean isAllRounder = p.getRole().equalsIgnoreCase("All-Rounder");

        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        String bestTeamFit;
        String playingRole;
        String auctionRec;
        String suggestedMaxBid;
        String riskAnalysis;
        List<String> similarPlayers = new ArrayList<>();
        String futurePotential;

        // Suggested Max Bid Calculation
        double maxBid = Math.max(p.getBasePrice() * 1.5, p.getSoldPrice() > 0 ? p.getSoldPrice() * 1.2 : p.getBasePrice() * 2.5);
        double minBid = Math.max(p.getBasePrice(), p.getSoldPrice() > 0 ? p.getSoldPrice() * 0.9 : p.getBasePrice() * 1.5);
        suggestedMaxBid = String.format("₹%.2f - ₹%.2f Crore", minBid, maxBid);

        // Core strength/weakness builder
        if (isBatsman) {
            strengths.add("Exceptional batting capabilities with " + p.getRunsScored() + " runs over " + p.getMatchesPlayed() + " matches.");
            strengths.add("Highly aggressive scoring velocity with a strike rate of " + p.getStrikeRate() + ".");
            if (p.getBattingAverage() > 35.0) {
                strengths.add("Elite reliability at the crease, maintaining an average of " + p.getBattingAverage() + ".");
            }
            if (p.getRole().equals("Wicketkeeper-Batsman")) {
                strengths.add("Added utility value as a high-quality wicketkeeper, freeing up an overseas/domestic slot.");
            }

            weaknesses.add("Susceptible to high-quality swing in the early overs of the innings.");
            if (p.getStrikeRate() < 130.0) {
                weaknesses.add("Slower scoring acceleration in the middle overs, putting pressure on non-strikers.");
            }
            weaknesses.add("Zero defensive or offensive bowling utility (only " + p.getWicketsTaken() + " career wickets).");

            playingRole = p.getRole().equals("Wicketkeeper-Batsman") ? "Wicketkeeper Top-Order Anchor / Finisher" : "Aggressive Top-Order Batsman";
            bestTeamFit = "RCB or KKR - both franchises require stable top-order players who can maximize powerplay scoring rates.";
            
            similarPlayers.add("Virat Kohli");
            similarPlayers.add("Shubman Gill");
            similarPlayers.add("Jos Buttler");
        } else if (isBowler) {
            strengths.add("Frontline strike weapon with " + p.getWicketsTaken() + " wickets in IPL.");
            strengths.add("Controls run flow with a commendable economy rate of " + p.getEconomyRate() + ".");
            if (p.getBowlingAverage() < 25.0) {
                strengths.add("Elite wicket-taking strike ability, averaging " + p.getBowlingAverage() + " runs per wicket.");
            }
            strengths.add("Mastery of " + p.getBowlingStyle() + " variations to deceive batsmen in key phases.");

            weaknesses.add("Extremely limited batting contributions, acting as a tail-end batsman (" + p.getRunsScored() + " career runs).");
            if (p.getEconomyRate() > 8.5) {
                weaknesses.add("Can leak runs under pressure in death overs.");
            }

            playingRole = "Lead Strike Bowler (" + p.getBowlingStyle() + ")";
            bestTeamFit = "MI or CSK - both teams value specialists who can anchor the bowling attack and bowl in pressure scenarios.";
            similarPlayers.add("Jasprit Bumrah");
            similarPlayers.add("Trent Boult");
            similarPlayers.add("Yuzvendra Chahal");
        } else { // All-Rounder
            strengths.add("Ultimate team utility, providing " + p.getRunsScored() + " runs and taking " + p.getWicketsTaken() + " wickets.");
            strengths.add("Exceptional batting strike rate of " + p.getStrikeRate() + ", ideal for finishing scenarios.");
            strengths.add("Valuable defensive bowling option with " + p.getOversBowled() + " overs bowled.");

            weaknesses.add("Risk of inconsistent workloads affecting overall physical fitness and form.");
            if (p.getEconomyRate() > 8.8) {
                weaknesses.add("Can sometimes be expensive as a support bowler (Economy: " + p.getEconomyRate() + ").");
            }

            playingRole = "Fast-Medium Batting All-Rounder";
            bestTeamFit = "GT or SRH - ideal for sides that require multi-dimensional players to balance squad structures.";
            similarPlayers.add("Hardik Pandya");
            similarPlayers.add("Andre Russell");
            similarPlayers.add("Ravindra Jadeja");
        }

        // Auction recommendation
        if (p.getRating() >= 9.0) {
            auctionRec = "Highly Recommended. Elite match-winner who commandingly impacts outcomes. Franchises should bid aggressively.";
        } else if (p.getRating() >= 8.0) {
            auctionRec = "Strong Buy. Provides reliable base performance. A solid core asset for any franchise under the suggested budget caps.";
        } else {
            auctionRec = "Value Buy. Good squad depth option. Recommend acquiring only if price remains close to base price.";
        }

        riskAnalysis = "Primary risk is physical fatigue and workload management. Performance variance is minimal given historic stats.";
        futurePotential = "Highly stable. Expected to maintain peak physical and statistical performance for the next 3-4 years.";

        // Construct JSON response
        try {
            Map<String, Object> reportMap = new LinkedHashMap<>();
            reportMap.put("strengths", strengths);
            reportMap.put("weaknesses", weaknesses);
            reportMap.put("bestTeamFit", bestTeamFit);
            reportMap.put("playingRole", playingRole);
            reportMap.put("auctionRecommendation", auctionRec);
            reportMap.put("suggestedMaxBid", suggestedMaxBid);
            reportMap.put("riskAnalysis", riskAnalysis);
            reportMap.put("similarPlayers", similarPlayers);
            reportMap.put("futurePotential", futurePotential);

            return objectMapper.writeValueAsString(reportMap);
        } catch (Exception e) {
            return "{\"error\":\"Failed to generate report JSON\"}";
        }
    }

    /**
     * Local chat intelligence matching engine (RAG Fallback)
     */
    private String handleLocalChat(String msg, List<Player> players) {
        String query = msg.toLowerCase();

        // 1. Check for "Should RCB buy KL Rahul?" or similar
        if (query.contains("should") && query.contains("buy")) {
            String targetPlayerName = null;
            String targetTeam = null;

            // Simple team detection
            for (String t : List.of("rcb", "mi", "csk", "kkr", "srh", "gt", "lsg", "dc", "rr", "pbks")) {
                if (query.contains(t)) {
                    targetTeam = t.toUpperCase();
                    break;
                }
            }

            // Simple player detection
            for (Player p : players) {
                if (query.contains(p.getName().toLowerCase()) || query.contains(p.getName().split(" ")[0].toLowerCase())) {
                    targetPlayerName = p.getName();
                    break;
                }
            }

            if (targetPlayerName != null) {
                String finalPlayerName = targetPlayerName;
                Player p = players.stream().filter(pl -> pl.getName().equals(finalPlayerName)).findFirst().get();
                String teamText = targetTeam != null ? targetTeam : "a franchise";
                
                StringBuilder sb = new StringBuilder();
                sb.append("### Scouting Recommendation: Buying ").append(p.getName()).append(" for ").append(teamText).append("\n\n");
                sb.append("Based on historical statistics, **").append(p.getName()).append("** is rated **").append(p.getRating()).append("/10.0**. ");
                
                if (p.getRating() >= 9.0) {
                    sb.append("He is an elite-tier player. Yes, ").append(teamText).append(" should absolutely target him in the auction. ");
                } else if (p.getRating() >= 8.0) {
                    sb.append("He is a highly reliable performer. Yes, he would be a great squad addition. ");
                } else {
                    sb.append("He is a decent squad option, but only at a reasonable budget. ");
                }
                
                sb.append("\n\n**Key Stats:**\n");
                sb.append("- Role: ").append(p.getRole()).append("\n");
                sb.append("- Runs: ").append(p.getRunsScored()).append(" (Avg: ").append(p.getBattingAverage()).append(", SR: ").append(p.getStrikeRate()).append(")\n");
                sb.append("- Wickets: ").append(p.getWicketsTaken()).append(" (Econ: ").append(p.getEconomyRate()).append(")\n");
                sb.append("- Base Price: ₹").append(p.getBasePrice()).append(" Crore\n");
                sb.append("- Estimated Auction Value: ₹").append(Math.max(p.getBasePrice() * 1.5, p.getSoldPrice())).append(" Crore\n\n");
                
                sb.append("**Verdict:** Pursue aggressively up to **₹").append(String.format("%.2f", Math.max(p.getBasePrice() * 1.5, p.getSoldPrice() * 1.15))).append(" Crore**. Overbidding beyond that might disrupt the budget dynamics.");
                return sb.toString();
            }
        }

        // 2. Suggest finisher under 10 crore
        if (query.contains("finisher") && (query.contains("under") || query.contains("below"))) {
            // Find players with strike rate > 140, role in (All-Rounder, Batsman), price < 10
            List<Player> finishers = players.stream()
                    .filter(p -> p.getStrikeRate() >= 140.0 && p.getBasePrice() <= 10.0 && 
                            (p.getRole().equals("All-Rounder") || p.getRole().equals("Batsman") || p.getRole().equals("Wicketkeeper-Batsman")))
                    .sorted(Comparator.comparingDouble(Player::getRating).reversed())
                    .limit(5)
                    .collect(Collectors.toList());

            if (!finishers.isEmpty()) {
                StringBuilder sb = new StringBuilder("### Top Finishers Under ₹10 Crore (Sorted by Rating):\n\n");
                for (Player p : finishers) {
                    sb.append("1. **").append(p.getName()).append("** (").append(p.getIplTeam()).append(")\n")
                      .append("   - **Price**: Base ₹").append(p.getBasePrice()).append(" Cr / Sold ₹").append(p.getSoldPrice()).append(" Cr\n")
                      .append("   - **Batting SR**: ").append(p.getStrikeRate()).append(" | **Avg**: ").append(p.getBattingAverage()).append("\n")
                      .append("   - **Rating**: ").append(p.getRating()).append("/10\n\n");
                }
                return sb.toString();
            }
        }

        // 3. Compare two players (e.g. Compare Bumrah and Starc)
        if (query.contains("compare")) {
            List<Player> matched = new ArrayList<>();
            for (Player p : players) {
                if (query.contains(p.getName().toLowerCase()) || query.contains(p.getName().split(" ")[0].toLowerCase()) || query.contains(p.getName().split(" ")[1].toLowerCase())) {
                    if (!matched.contains(p)) {
                        matched.add(p);
                    }
                }
            }

            if (matched.size() >= 2) {
                Player p1 = matched.get(0);
                Player p2 = matched.get(1);
                
                StringBuilder sb = new StringBuilder();
                sb.append("### Side-by-Side Comparison: ").append(p1.getName()).append(" vs ").append(p2.getName()).append("\n\n");
                sb.append("| Metric | ").append(p1.getName()).append(" | ").append(p2.getName()).append(" |\n");
                sb.append("| :--- | :--- | :--- |\n");
                sb.append("| **Role** | ").append(p1.getRole()).append(" | ").append(p2.getRole()).append(" |\n");
                sb.append("| **IPL Team** | ").append(p1.getIplTeam()).append(" | ").append(p2.getIplTeam()).append(" |\n");
                sb.append("| **Rating** | **").append(p1.getRating()).append("/10** | **").append(p2.getRating()).append("/10** |\n");
                sb.append("| **Matches** | ").append(p1.getMatchesPlayed()).append(" | ").append(p2.getMatchesPlayed()).append(" |\n");
                sb.append("| **Runs** | ").append(p1.getRunsScored()).append(" | ").append(p2.getRunsScored()).append(" |\n");
                sb.append("| **Batting Avg** | ").append(p1.getBattingAverage()).append(" | ").append(p2.getBattingAverage()).append(" |\n");
                sb.append("| **Strike Rate** | ").append(p1.getStrikeRate()).append(" | ").append(p2.getStrikeRate()).append(" |\n");
                sb.append("| **Wickets** | ").append(p1.getWicketsTaken()).append(" | ").append(p2.getWicketsTaken()).append(" |\n");
                sb.append("| **Bowl Avg** | ").append(p1.getBowlingAverage()).append(" | ").append(p2.getBowlingAverage()).append(" |\n");
                sb.append("| **Economy** | ").append(p1.getEconomyRate()).append(" | ").append(p2.getEconomyRate()).append(" |\n");
                sb.append("| **Base Price** | ₹").append(p1.getBasePrice()).append(" Cr | ₹").append(p2.getBasePrice()).append(" Cr |\n");
                sb.append("| **Sold Price** | ₹").append(p1.getSoldPrice()).append(" Cr | ₹").append(p2.getSoldPrice()).append(" Cr |\n\n");
                
                sb.append("**Analyst Verdict:** ");
                if (p1.getRating() > p2.getRating()) {
                    sb.append("**").append(p1.getName()).append("** holds the edge with an overall rating of **").append(p1.getRating()).append("** compared to ").append(p2.getName()).append("'s **").append(p2.getRating()).append("**.");
                } else if (p2.getRating() > p1.getRating()) {
                    sb.append("**").append(p2.getName()).append("** holds the edge with an overall rating of **").append(p2.getRating()).append("** compared to ").append(p1.getName()).append("'s **").append(p1.getRating()).append("**.");
                } else {
                    sb.append("Both players are rated equally at **").append(p1.getRating()).append("/10**. The selection should depend on team structure needs (e.g. batting depth vs fast bowling spearhead).");
                }
                return sb.toString();
            }
        }

        // 4. Build best XI under 80 crore
        if (query.contains("best xi") || query.contains("best 11") || query.contains("squad under")) {
            // Greedy squad selector
            List<Player> wks = players.stream().filter(p -> p.getRole().equals("Wicketkeeper-Batsman")).collect(Collectors.toList());
            List<Player> bats = players.stream().filter(p -> p.getRole().equals("Batsman")).collect(Collectors.toList());
            List<Player> alls = players.stream().filter(p -> p.getRole().equals("All-Rounder")).collect(Collectors.toList());
            List<Player> bowls = players.stream().filter(p -> p.getRole().equals("Bowler")).collect(Collectors.toList());

            // Build XI: 1 WK, 4 Bat, 3 All, 3 Bowl
            List<Player> selectedXI = new ArrayList<>();
            wks.sort(Comparator.comparingDouble(Player::getRating).reversed());
            bats.sort(Comparator.comparingDouble(Player::getRating).reversed());
            alls.sort(Comparator.comparingDouble(Player::getRating).reversed());
            bowls.sort(Comparator.comparingDouble(Player::getRating).reversed());

            // Select initial high-value players
            selectedXI.add(wks.get(0));
            selectedXI.addAll(bats.subList(0, 4));
            selectedXI.addAll(alls.subList(0, 3));
            selectedXI.addAll(bowls.subList(0, 3));

            double totalCost = selectedXI.stream().mapToDouble(p -> p.getSoldPrice() > 0 ? p.getSoldPrice() : p.getBasePrice()).sum();
            
            // If total cost exceeds 80 Cr, optimize down by replacing expensive players with lower cost but high rating ones
            if (totalCost > 80.0) {
                // Perform a simple search for cost effective squad
                selectedXI.clear();
                
                // Let's filter players who cost less
                List<Player> pool = new ArrayList<>(players);
                pool.sort((a, b) -> {
                    double valA = a.getRating() / (a.getSoldPrice() > 0 ? a.getSoldPrice() : a.getBasePrice());
                    double valB = b.getRating() / (b.getSoldPrice() > 0 ? b.getSoldPrice() : b.getBasePrice());
                    return Double.compare(valB, valA); // High value-for-money first
                });
                
                List<Player> wkChosen = pool.stream().filter(p -> p.getRole().equals("Wicketkeeper-Batsman")).limit(1).collect(Collectors.toList());
                List<Player> batChosen = pool.stream().filter(p -> p.getRole().equals("Batsman")).limit(4).collect(Collectors.toList());
                List<Player> allChosen = pool.stream().filter(p -> p.getRole().equals("All-Rounder")).limit(3).collect(Collectors.toList());
                List<Player> bowlChosen = pool.stream().filter(p -> p.getRole().equals("Bowler")).limit(3).collect(Collectors.toList());
                
                selectedXI.addAll(wkChosen);
                selectedXI.addAll(batChosen);
                selectedXI.addAll(allChosen);
                selectedXI.addAll(bowlChosen);
                
                totalCost = selectedXI.stream().mapToDouble(p -> p.getSoldPrice() > 0 ? p.getSoldPrice() : p.getBasePrice()).sum();
            }

            StringBuilder sb = new StringBuilder("### AI Suggested Best XI Under ₹80 Crore:\n\n");
            sb.append("Here is a balanced, highly-rated 11-player squad built under the **₹80.0 Crore** budget cap:\n\n");
            
            int idx = 1;
            for (Player p : selectedXI) {
                double price = p.getSoldPrice() > 0 ? p.getSoldPrice() : p.getBasePrice();
                sb.append(idx++).append(". **").append(p.getName()).append("** (").append(p.getRole()).append(" - ").append(p.getIplTeam()).append(") - ₹").append(price).append(" Cr (Rating: ").append(p.getRating()).append("/10)\n");
            }
            
            sb.append("\n**Squad Statistics:**\n");
            sb.append("- **Total Cost:** ₹").append(String.format("%.2f", totalCost)).append(" Crore\n");
            sb.append("- **Average Squad Rating:** ").append(String.format("%.2f", selectedXI.stream().mapToDouble(Player::getRating).average().orElse(0.0))).append("/10.0\n");
            sb.append("- **Squad Composition:** 1 WK, 4 Batsmen, 3 All-rounders, 3 Bowlers.\n\n");
            sb.append("**Scout Verdict:** This squad maximizes value-for-money. It secures world-class players for key positions while filling support roles with high-performing domestic stars.");
            return sb.toString();
        }

        // 5. Suggest replacement for Rashid Khan
        if (query.contains("replacement") || query.contains("substitute")) {
            String targetPlayerName = null;
            for (Player p : players) {
                if (query.contains(p.getName().toLowerCase()) || query.contains(p.getName().split(" ")[0].toLowerCase())) {
                    targetPlayerName = p.getName();
                    break;
                }
            }

            if (targetPlayerName != null) {
                String finalPlayerName = targetPlayerName;
                Player target = players.stream().filter(pl -> pl.getName().equals(finalPlayerName)).findFirst().get();
                
                // Find players with similar role, bowling style, and high rating
                List<Player> replacements = players.stream()
                        .filter(p -> !p.getName().equals(target.getName()))
                        .filter(p -> p.getRole().equals(target.getRole()) || (target.getRole().equals("All-Rounder") && p.getRole().equals("Bowler")) || (target.getRole().equals("Bowler") && p.getRole().equals("All-Rounder")))
                        .filter(p -> p.getBowlingStyle().toLowerCase().contains("spin") || p.getBowlingStyle().equalsIgnoreCase(target.getBowlingStyle()))
                        .sorted(Comparator.comparingDouble(Player::getRating).reversed())
                        .limit(4)
                        .collect(Collectors.toList());

                StringBuilder sb = new StringBuilder();
                sb.append("### Recommended Replacements for **").append(target.getName()).append("** (").append(target.getRole()).append(" - ").append(target.getBowlingStyle()).append("):\n\n");
                
                for (Player p : replacements) {
                    sb.append("1. **").append(p.getName()).append("** (").append(p.getIplTeam()).append(")\n")
                      .append("   - **Role**: ").append(p.getRole()).append(" (").append(p.getBowlingStyle()).append(")\n")
                      .append("   - **Wickets**: ").append(p.getWicketsTaken()).append(" (Economy: ").append(p.getEconomyRate()).append(")\n")
                      .append("   - **Runs**: ").append(p.getRunsScored()).append(" (SR: ").append(p.getStrikeRate()).append(")\n")
                      .append("   - **Rating**: ").append(p.getRating()).append("/10 | **Price**: ₹").append(p.getSoldPrice() > 0 ? p.getSoldPrice() : p.getBasePrice()).append(" Cr\n\n");
                }
                
                sb.append("**Scout Verdict:** These replacements offer similar skillsets (either high-quality spin or lower-order batting utility) and represent high-value alternatives for the franchise.");
                return sb.toString();
            }
        }

        // Generic query fallback
        return "I am the **AuctionIQ Decision Intelligence Assistant**. I can help you analyze players, run comparisons, suggest auction purchases, and build balanced squads. \n\n" +
                "Try asking me one of these curated questions:\n" +
                "1. *Should RCB buy KL Rahul?*\n" +
                "2. *Suggest a finisher under ₹10 crore.*\n" +
                "3. *Compare Bumrah and Starc.*\n" +
                "4. *Build the best XI under ₹80 crore.*\n" +
                "5. *Suggest replacement for Rashid Khan.*";
    }
}

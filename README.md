# AuctionIQ – AI-Powered Cricket Scouting & Decision Intelligence Platform

AuctionIQ is a comprehensive, production-ready full-stack decision intelligence application designed to help IPL franchises analyze cricket player profiles, run comparative head-to-head metrics, and generate AI-powered scouting evaluations before player auctions.

---

## 🚀 Key Features

1. **Secure JWT Authentication**: Clean user sign-up and login utilizing Spring Security, password hashing, and stateless JSON Web Token (JWT) authorization.
2. **Interactive Dashboard**: Provides high-level scout insights (total players, average rating, marquee players, cap space value) along with a quick-search autocomplete widget and recent generated evaluations.
3. **Advanced Player Directory**: Dynamic query filtering allowing scouts to filter 100 realistic player profiles by franchise, playing role, country, and debounced name matching.
4. **Side-by-Side Player Comparison**: Dual selection panels with metrics comparison highlighting the superior batsman/bowler statistics in green.
5. **AI Scouting Evaluation Engine**: Utilizes Google Gemini API to construct professional player dossiers (Strengths, Weaknesses, Best Team Fit, Suggested Bid range, Risk Analysis, Similar Profiles).
6. **Smart AI Chat Assistant**: Floating conversational agent equipped with complete player database context (RAG) to solve complex questions ("Build the best XI under 80 crore", "Should RCB buy KL Rahul?").
7. **Zero-Setup Fallback Mode**: If `GEMINI_API_KEY` is not present, the system runs a local statistical AI generator and query rules engine. If PostgreSQL is not active, the app falls back to an in-memory H2 database.

---

## 🛠️ Technology Stack

- **Backend**: Java 21, Spring Boot 3.3.4, Spring Security, Spring Data JPA, Hibernate, Maven, Swagger/OpenAPI.
- **Frontend**: React (Vite), Tailwind CSS v3, Axios, standard HTML5.
- **Database**: PostgreSQL (Production) / H2 (Development/Zero-configuration).
- **AI Integration**: Google Gemini API (v1beta Rest Interface).

---

## 📂 Project Structure

```
Epam-AuctionIQ/
│
├── auctioniq-backend/          # Spring Boot Maven Project
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/auctioniq/
│           │   ├── config/     # Spring Security & Swagger Configuration
│           │   ├── controller/ # REST Endpoints
│           │   ├── dto/        # Request/Response DTOs (Java Records)
│           │   ├── entity/     # JPA Entities (User, Player, SavedReport)
│           │   ├── exception/  # Global Exception Handler (RFC-7807)
│           │   ├── mapper/     # Entity <-> DTO Conversions
│           │   ├── repository/ # Spring Data Repositories
│           │   ├── security/   # JWT filters, UserDetailsService
│           │   ├── service/    # Gemini Service, Player & Auth Services
│           │   └── AuctionIqApplication.java
│           └── resources/
│               ├── application.properties
│               ├── application-h2.properties
│               ├── application-postgres.properties
│               └── players.json # 100 IPL players dataset
│
├── auctioniq-frontend/         # React Frontend Project
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── components/         # Shared Layouts and Protected Routes
│   │   ├── context/            # AuthContext (JWT State Management)
│   │   ├── pages/              # Login, Register, Dashboard, Directory, etc.
│   │   ├── services/           # api.js client
│   │   ├── App.jsx             # React Routes config
│   │   ├── index.css           # Tailwind custom overrides
│   │   └── main.jsx
│   └── index.html
│
├── schema_and_data.sql         # Standalone Database setup script
└── README.md                   # Project Documentation
```

---

## 💾 Database Configuration

The application is configured to support two modes:
- **H2 (Default Dev)**: No installation required. Runs instantly in memory.
- **PostgreSQL (Production)**: Stores persistent data.

### Setting Up PostgreSQL
1. Create a database named `auctioniq` on port `5432`.
2. Execute the DDL/DML script [schema_and_data.sql](file:///d:/Interview Projects/Epam-AuctionIQ/schema_and_data.sql) in your query tool to set up tables and insert the 100 players.
3. In [application.properties](file:///d:/Interview Projects/Epam-AuctionIQ/auctioniq-backend/src/main/resources/application.properties), switch the active profile:
   ```properties
   spring.profiles.active=postgres
   ```

---

## ⚙️ How to Build and Run

### 1. Run the Backend
1. Set your Gemini API key (Optional):
   ```powershell
   $env:GEMINI_API_KEY="your-api-key-here"
   ```
   *(If not set, the platform operates in local mock AI mode automatically).*
2. Open terminal in `auctioniq-backend/` and execute:
   ```bash
   mvn spring-boot:run
   ```
3. The server starts at `http://localhost:8080`.
4. Access the Interactive API Swagger docs at `http://localhost:8080/swagger-ui.html`.

### 2. Run the Frontend
1. Open terminal in `auctioniq-frontend/` and execute:
   ```bash
   npm install
   npm run dev
   ```
2. The client will start at `http://localhost:5173`.
3. Open `http://localhost:5173` in your browser.
4. Click **Register** to create a scout profile, then log in.

---

## 📊 API Documentation Summary

| Endpoint | Method | Security | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register a new scout account |
| `/api/auth/login` | `POST` | Public | Login and receive a JWT authorization token |
| `/api/auth/profile` | `GET` | Authenticated | Retrieve logged-in scout details |
| `/api/auth/profile` | `PUT` | Authenticated | Update email or favorite IPL team |
| `/api/players` | `GET` | Authenticated | Retrieve & search players with filters |
| `/api/players/{id}` | `GET` | Authenticated | Get detailed career stats by player ID |
| `/api/players/meta/{teams\|roles\|countries}` | `GET` | Authenticated | Get distinct dropdown metadata values |
| `/api/compare` | `GET` | Authenticated | Fetch stats of two players side-by-side |
| `/api/ai/report` | `POST` | Authenticated | Trigger AI generation and save scouting report |
| `/api/ai/chat` | `POST` | Authenticated | Conversational chat query with database context |
| `/api/saved-reports` | `GET` | Authenticated | List all generated reports for the logged-in scout |
| `/api/saved-reports/{id}` | `DELETE` | Authenticated | Remove an evaluation dossier |

---

## 🧠 AI Integration Mechanics
- **Scouting Reports**: The prompt details the player's career statistics and asks Gemini to return a structured JSON conforming to a specific schema. The backend sets the `responseMimeType` to `application/json` in `generationConfig` to ensure strict parsing.
- **RAG Chat Context**: The assistant prompt serializes all 100 players into a compressed CSV-like spreadsheet table and injects it as context before the user's chat message, letting the model perform complex math (like summing player costs) and make comparisons on real database stats.

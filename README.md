# QuizSphere - Modern Spring Boot & Vanilla JS Quiz Portal

QuizSphere is a premium, high-performance, and visually gorgeous SaaS-inspired educational and assessment platform. It lets users explore quizzes, answer single-choice, multiple-choice, true/false, and fill-in-the-blank questions, receive instant analytics feedback, compete on leaderboards, and track achievements completely local-storage based (no registration/login required).

---

## 🚀 Key Features

*   **Premium SaaS Aesthetics**: Responsive glassmorphism cards, micro-interactions, custom scrollbars, dark/light theme switching, and smooth dynamic layouts.
*   **Secure API Design**: Correct answer flags (`isCorrect` column) are strictly filtered out on quiz initiation. Grading and statistics calculation take place securely on the backend server.
*   **Assessment Simulator**: One-question-at-a-time slide view, flag questions drawer, sidebar quick navigator, keyboard selection shortcuts, and automated time-out.
*   **Local Dashboard & Gamification**:
    *   **User XP Progression**: Earn XP on successful completion. Track level progression.
    *   **Streak Tracking**: Interactive streak tracker showing consecutive active days.
    *   **Milestone Badges**: Dynamic locks/unlocks of custom badges (First Flight, Perfect Score, Speedster, Daily Quizzer, Polymath).
*   **Visual Analytics**: Graphical breakdown charts using Chart.js inside the results report card and profile dashboard.
*   **Printable PDF Certificates**: High-fidelity landscape certificate of completion auto-designed on the fly using `jsPDF` client-side canvas.

---

## 🛠️ Tech Stack

*   **Backend Core**: Java 21+, Spring Boot 3.3.0, Spring Data JPA, Hibernate ORM.
*   **Default Database**: Persistent local H2 database (stores data inside `./data/quizdb`).
*   **Production Option**: Configured profile for PostgreSQL/MySQL connection swapping.
*   **Frontend Core**: HTML5, CSS3, ES6+ Javascript Modules, Tailwind CSS integration.
*   **Visualization**: Chart.js library.
*   **Documents**: jsPDF library.

---

## 📂 Project Architecture

```
quiz-portal/
├── db/
│   ├── schema.sql              # Database schema definition
│   └── seed.sql                # SQL inserts for sample categories and questions
├── pom.xml                     # Maven project specification
├── README.md                   # Installation & Setup guidelines
├── SECURITY.md                 # Technical overview of security controls
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/
    │   │       └── quizportal/
    │   │           ├── QuizPortalApplication.java       # Main spring boot runner
    │   │           ├── model/                          # Database entities
    │   │           │   ├── Category.java
    │   │           │   ├── Quiz.java
    │   │           │   ├── Question.java
    │   │           │   ├── Option.java
    │   │           │   └── QuizResult.java
    │   │           ├── repository/                     # Spring data repositories
    │   │           ├── service/                        # Business logic & grading
    │   │           │   ├── QuizService.java
    │   │           │   └── LeaderboardService.java
    │   │           ├── controller/                     # REST API endpoints
    │   │           ├── dto/                            # Data transfer models (Hides answers!)
    │   │           └── config/                         # Boot initialization & CORS
    │   │               ├── DatabaseInitializer.java    # Seeds H2 on application startup
    │   │               └── CorsConfig.java
    │   └── resources/
    │       ├── application.yml                         # Spring configuration file
    │       └── static/                                 # Frontend SPA static directory
    │           ├── index.html
    │           ├── css/
    │           │   └── styles.css
    │           └── js/
    │               ├── app.js                          # SPA routes & quiz engine
    │               ├── api.js                          # HTTP REST fetch wrapper
    │               └── dashboard.js                    # Gamification & Charts
    └── test/
        └── java/
            └── com/
                └── quizportal/
                    └── service/
                        └── QuizServiceTest.java        # Unit & Integration tests
```

---

## ⚡ Setup & Installation

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Java Development Kit (JDK) 21+](https://adoptium.net/temurin/releases/?version=21)
*   [Apache Maven 3.9+](https://maven.apache.org/)

### 2. Running Locally (H2 default)
The application comes preconfigured with a file-based H2 database that requires zero installation or configuration. It compiles, creates the tables, and seeds mock data automatically on startup.

1.  Clone or copy the project files to your folder.
2.  Open a terminal inside the `/quiz-portal` directory.
3.  Compile and start the Spring Boot server:
    ```bash
    mvn clean spring-boot:run
    ```
4.  Open your browser and navigate to:
    ```
    http://localhost:8080
    ```

*Note: You can inspect the H2 database tables and run queries by opening the H2 console at `http://localhost:8080/h2-console` using JDBC URL `jdbc:h2:file:./data/quizdb` with username `sa` and password `password`.*

### 3. PostgreSQL Swap (Optional)
If you'd like to run the application with a PostgreSQL database, you can run the application with the `postgres` Spring Profile activated:

1.  Ensure you have a PostgreSQL server running and database `quizdb` created.
2.  Export environment variable credentials:
    *   `DATABASE_URL` (Default: `jdbc:postgresql://localhost:5432/quizdb`)
    *   `DATABASE_USER` (Default: `postgres`)
    *   `DATABASE_PASSWORD`
3.  Start Spring Boot with the postgres profile:
    ```bash
    mvn spring-boot:run -Dspring-boot.run.profiles=postgres
    ```

---

## 🧪 Running Unit & Integration Tests

We have included test cases verifying the core grading engine calculations, category suggestions, and cheating prevention security.

To run the Maven test suite:
```bash
mvn test
```
All tests will output results inside your console shell.

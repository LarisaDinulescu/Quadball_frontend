# Quadballholic - Frontend UI

*Note: This repository contains the User Interface for the Quadballholic project. For the main architectural analysis, the Kata requirements, and the backend implementations, please visit our [Main Repository](https://github.com/denizbayan/Quadballholic-backend).*

# Part I: Introduction and Setup
## 1. Overview
This application serves as the unified User Interface for all stakeholders defined in the Kata:
* **Organization Staff:** To manage tournaments and officials.
* **Club Managers:** To register teams and manage rosters.
* **Spectators & Fans:** To view real-time live match updates, leaderboards, and book tickets.

## 2. Getting Started
### 2.1 Prerequisites
Thanks to containerization, setting up the frontend is incredibly straightforward.

* Recommended: Docker and Docker Compose. By using Docker, there is no need to have Node.js or npm installed on your local machine. Docker handles the entire build and runtime environment by design.

* Alternative (Local Dev): Node.js and npm installed (if you wish to run it outside of Docker).

* Important: You must have one of our backends (Modular Monolith OR Microservices) running on port 8080 before starting the frontend, otherwise API calls will fail.

### 2.2 Installation and Build Instructions
**Using Docker (Recommended):**
Open a terminal in the root folder of this repository and simply build the image using docker compose. The Dockerfile handles the npm install and builds the application automatically in isolated containers.

**Using Local npm (Alternative):**
If you prefer to run it locally without Docker:
```bash
npm install
```

### 2.3 Running the Application
**Using Docker:**
```bash
docker compose up -d
```

**Using Local npm:**
```bash
npm start
```
The application will open automatically in your browser at `http://localhost:3000`.

### 2.4 Environmental Configuration and Test Credentials
Our backend is equipped with a `DataSeedingConfig` that populates the database on startup. You can log in immediately on `http://localhost:3000/login` using the following test accounts:

* Admin / Organization Manager (Full Access):
  * Email: ROLE_ORGANIZATION_MANAGER@test.com
  * Password: 123456

* Player / Spectator:
  * Email: ROLE_SPECTATOR@test.com
  * Password: 123456

**Frontend Integration URLs**
The frontend communicates with the backend via the following base endpoints:
REST API: `http://localhost:8080/api/...`
WebSockets: `http://localhost:8080/ws-quadball/...`

# Part II: Architectural Design
## The Choice of a Monolithic Frontend
While microservices are heavily utilized in our backend architecture, we deliberately chose to build a Monolithic Frontend. Although the micro-frontend pattern exists and can be applied to UIs, we evaluated the trade-offs and decided against it for this specific project.

In typical web applications of this scope, the performance and scaling bottleneck resides almost entirely within the backend (data processing, concurrent transactions, database locks). Introducing micro-frontends would have added unnecessary infrastructure overhead, complex deployment pipelines, and state-sharing complications. We preferred simplicity and a cohesive developer experience, ensuring a lightweight, fast, and unified React application.

## API Transparency
This single frontend application is designed to work seamlessly with both of our backend architectural styles:

* **The Modular Monolith** (Running directly on `localhost:8080`)
* **The Distributed Microservices** (Running behind the API Gateway on `localhost:8080`)

Why is this important? By strictly enforcing our API contracts (using `/api/` for REST and `/ws-quadball/` for WebSockets), we achieved complete **API Transparency**. The frontend client is completely unaware of the underlying infrastructure. Whether it is communicating with a single Spring Boot monolith or dynamically routed via Eureka through a Spring Cloud Gateway, the frontend requires **zero code changes**.

# Part III: Functionalities
The UI is divided into several core functional areas mapped to the business domains:

* **Tournament & Bracket Management**: A visual interface for Organization Managers to create tournaments, assign teams, and dynamically generate elimination brackets.

* **Live Match Center**: A real-time dashboard powered by WebSockets. Match visibility is dynamically filtered by user role: Spectators and Fans can view all past results and currently active (Live) matches. Organization Managers, on the other hand, have unrestricted access to the entire timeline (past, present, and future scheduled matches) and possess the administrative ability to trigger, simulate, or re-simulate any match regardless of its official scheduled date.

* **Booking & Ticketing**: A dedicated flow for spectators to reserve seats for upcoming matches, complete with a user profile dashboard to track ticket codes and seat numbers.

* **Team & Roster Configuration**: CRUD interfaces allowing managers to register new Quadball teams, add players, and assign match officials (Referees) to stadiums.

---


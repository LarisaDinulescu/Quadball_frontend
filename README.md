# 💻 Quadballholic - Frontend UI

*Note: This repository contains the User Interface for the Quadballholic project. For the main architectural analysis, the Kata requirements, and the backend implementations, please visit our [Main Repository](https://github.com/denizbayan/Quadballholic-backend).*

## 📖 Overview
This application serves as the unified User Interface for all stakeholders defined in the Kata:
* **Organization Staff:** To manage tournaments and officials.
* **Club Managers:** To register teams and manage rosters.
* **Spectators & Fans:** To view real-time live match updates, leaderboards, and book tickets.

---

## 🏗️ Architectural Note: API Transparency
This single frontend application is designed to work seamlessly with **both** of our backend architectural styles:
1. **The Modular Monolith** (Running directly on `localhost:8080`)
2. **The Distributed Microservices** (Running behind the API Gateway on `localhost:8080`)

**Why is this important?** By strictly enforcing our API contracts (`/api/...` for REST and `/ws-quadball/...` for WebSockets), we achieved complete **API Transparency**. The frontend client is completely unaware of the underlying infrastructure. Whether it is communicating with a single Spring Boot monolith or dynamically routed via Eureka through a Spring Cloud Gateway, the frontend requires **zero code changes**.

---

## 🚀 How to Run (Local Environment)

### Prerequisites
* Node.js and npm installed.
* **Important:** You must have one of our backends (Monolith OR Microservices) running on port `8080` before starting the frontend, otherwise API calls will fail.

### Installation & Startup
1. Open a terminal in the root folder of this repository.
2. Install the dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm start
```
(If you are using Vite, the command might be npm run dev)

The application will open automatically in your browser at http://localhost:3000.

## 🔑 Test Credentials
Our backend is equipped with a DataSeedingConfig that populates the database on startup. You can log in immediately using the following test accounts:

### Admin / Organization Manager (Full Access):

Email: ROLE_ORGANIZATION_MANAGER@test.com

Password: 123456

### Player / Spectator:

Email: ROLE_SPECTATOR@test.com

Password: 123456

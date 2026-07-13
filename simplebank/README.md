# SimpleBank Full-Stack Microservices Architecture

Welcome to **SimpleBank**, a high-fidelity learning application showcasing a modular banking ecosystem.

This repository features two parts:
1. **Interactive Demo Applet (Live Preview)**: A fully functioning React/TypeScript + Node.js/Express server running on Port 3000 in your browser, using an in-memory ledger engine so you can test it live immediately.
2. **Local Java Spring Boot + PostgreSQL Architecture (This Folder)**: The real production-grade microservices and database code designed to be compiled, run locally, and integrated with the React frontend.

---

## 1. System Architecture

```
                    ┌────────────────────────┐
                    │     React Frontend     │
                    │  (Port 3000 / Axios)   │
                    └───────────┬────────────┘
                                │ (REST API calls)
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
┌──────────────┐        ┌──────────────┐         ┌──────────────┐
│ User Service │        │ Account Serv │         │ Transact Serv│
│ (Port 8081)  │        │ (Port 8082)  │         │ (Port 8083)  │
└──────┬───────┘        └──────┬───────┘         └──────┬───────┘
       │                       │                        │
       │                       │ (RestTemplate communication)
       └───────────────────────┼────────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ PostgreSQL Database │
                    │ (Port 5432 / JPA)   │
                    └─────────────────────┘
```

---

## 2. Directory Structure

```
simplebank/
├── schema.sql                 # PostgreSQL Database DDL Schemas & seed records
├── README.md                  # This architectural & execution manual
├── frontend/                  # React + Tailwind + Axios SPA Code base
└── backend/
    ├── user-service/          # Spring Boot Microservice for user accounts & auth (Port 8081)
    ├── account-service/       # Spring Boot Microservice for bank account details (Port 8082)
    └── transaction-service/   # Spring Boot Microservice for transfers & deposits (Port 8083)
```

---

## 3. Database Schema Models (PostgreSQL)

See details in the `./schema.sql` file:

*   **User**: `id` (PK), `first_name`, `last_name`, `email` (Unique), `password`
*   **Account**: `id` (PK), `user_id` (FK), `account_number` (Unique), `balance`, `account_type`
*   **Transaction**: `id` (PK), `account_id` (FK), `type` (`DEPOSIT`, `WITHDRAWAL`, `TRANSFER_OUT`, `TRANSFER_IN`), `amount`, `status`, `created_date`, `description`

---

## 4. How to Run Everything Locally

### Step 1: Connect PostgreSQL Database
1. Make sure PostgreSQL is running on your machine on port `5432`.
2. Connect using your favorite SQL client (e.g., pgAdmin, DBeaver) or standard terminal CLI:
   ```bash
   psql -U postgres -h localhost
   ```
3. Create the database:
   ```sql
   CREATE DATABASE simplebank;
   ```
4. Run the SQL scripts in `./schema.sql` to generate tables and load initial sandbox records.

### Step 2: Run Spring Boot Microservices
For each microservice under `backend/` (`user-service`, `account-service`, `transaction-service`):
1. Navigate to the directory:
   ```bash
   cd backend/user-service
   ```
2. Verify database connection credentials inside `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/simplebank
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```
3. Boot the application using Maven:
   ```bash
   mvn spring-boot:run
   ```
4. Repeat this step for `account-service` and `transaction-service`. The services will run on ports `8081`, `8082`, and `8083` respectively.

### Step 3: Run the Frontend
1. Open your terminal in the frontend/ project root.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite local server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your web browser.

---

## 5. Connecting Frontend to Spring Boot Backend

In production or local development, you have two choices for connecting the frontend to the multi-service backend:

### Option A: API Gateway or Reverse Proxy (Recommended)
Configure Nginx or Vite Proxy (`vite.config.ts`) to route `/api/*` endpoints to corresponding ports:
```typescript
// Example vite.config.ts proxy configuration
server: {
  proxy: {
    '/api/users': 'http://localhost:8081',
    '/api/accounts': 'http://localhost:8082',
    '/api/transactions': 'http://localhost:8083',
  }
}
```

### Option B: Direct Axios Base URL Mapping
You can configure Axios to dynamically route endpoints based on pathname patterns directly in your React code:
```typescript
import axios from 'axios';

axios.interceptors.request.use((config) => {
  const url = config.url || '';
  if (url.startsWith('/api/users')) {
    config.baseURL = 'http://localhost:8081';
  } else if (url.startsWith('/api/accounts')) {
    config.baseURL = 'http://localhost:8082';
  } else if (url.startsWith('/api/transactions')) {
    config.baseURL = 'http://localhost:8083';
  }
  return config;
});
```
This is a standard pattern for microservice ecosystems without a dedicated Gateway server like Spring Cloud Gateway.

---

## 6. Pre-configured Sandbox Test Credentials
Log in instantly with the preloaded records inside the Postgres seed database:
*   **User A (Sarah Connor)**: `sarah@simplebank.com` / `password123`
*   **User B (John Connor)**: `john@simplebank.com` / `password123`

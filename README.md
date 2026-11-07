# 📦 CatalogHub: Cloud Computing Course Project

[![CI Pipeline](https://github.com/huy/CatalogHub_cloudComputing/actions/workflows/ci.yml/badge.svg)](https://github.com/huy/CatalogHub_cloudComputing/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![Knex.js](https://img.shields.io/badge/Knex.js-Migrations-E15433?logo=knex&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Edge_CDN-F38020?logo=cloudflare&logoColor=white)
![Railway](https://img.shields.io/badge/Railway.app-PaaS-0B0D0E?logo=railway&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

> **Course Topic:** Building and deploying a NodeJS + MySQL application on Railway.app featuring product addition and search capabilities. Include detailed documentation on the deployment process and MySQL connection setup.

---

## 🏛️ System & Cloud Architecture

```mermaid
flowchart TD
    User["🌐 End User (Browser)"]

    subgraph Cloudflare["☁️ Cloudflare Global Edge Network"]
        CF_CDN["Cloudflare Pages (Global CDN)"]
        StaticAssets["React 18 SPA (Vite + Tailwind CSS)\nMulti-region Edge Distribution"]
    end

    subgraph Railway["🚂 Railway.app Cloud Platform"]
        subgraph PublicZone["Public Facing Zone"]
            NodeBE["NodeJS Express Service\nLayered Architecture (Controller-Service-Repo)\nPort: 5000"]
        end

        subgraph PrivateMesh["Private Network Mesh (railway.internal)"]
            MySQLDB[("MySQL 8.0 Database\nmysql.railway.internal:3306\nManaged by Knex Migrations")]
        end
    end

    User -->|HTTPS: 443| CF_CDN
    CF_CDN --> StaticAssets
    User -->|REST API Calls (HTTPS: 443)| NodeBE
    NodeBE -->|Private Network WireGuard Mesh| MySQLDB
```

---

## 📚 Official Project Deliverables
1. **[System Architecture & Security Model (ARCHITECTURE.md)](./docs/ARCHITECTURE.md)**: Layered architecture, Cloud service models (NIST), cost optimization ($0 breakdown), Knex vs Flyway migration analysis, network isolation, and CI/CD pipelines.
2. **[Railway & MySQL Private Network Setup (RAILWAY_MYSQL_SETUP.md)](./docs/RAILWAY_MYSQL_SETUP.md)**: Step-by-step guide to provisioning managed MySQL, private DNS (`railway.internal`), environment variable references, automated Knex migration lifecycle, and troubleshooting common cloud errors.
3. **[Cloudflare Pages Deployment Guide (CLOUDFLARE_PAGES_DEPLOY.md)](./docs/CLOUDFLARE_PAGES_DEPLOY.md)**: Edge CDN deployment, Vite build settings, SPA routing redirects, and backend endpoint mapping.
4. **[Test & API Verification Guide (TEST_AND_API_GUIDE.md)](./docs/TEST_AND_API_GUIDE.md)**: Ready-to-run `cURL` test cases covering product creation, duplicate SKU rejection (409), Zod validation (400), keyword search, filtering, and database latency telemetry.

---

## 🏗️ Production Tech Stack

| Component | Technology | Rationale & Enterprise Standard |
| :--- | :--- | :--- |
| **Backend Runtime** | **Node.js 20 LTS** | Modern asynchronous runtime with ES Modules support |
| **Web Framework** | **Express 4.x** | Industry standard microservice framework |
| **Database Migrations** | **Knex.js** | **The Flyway equivalent in Node.js**: tracks schema versions in `knex_migrations`, supports bidirectional migrations (`up`/`down`), rollbacks, and seeds |
| **Schema Validation** | **Zod** | Type-safe, strict runtime input validation for bodies and queries |
| **Database Client** | **mysql2** | High-performance MySQL driver with connection pooling |
| **Frontend Framework** | **React 18 + Vite** | Component-based modern UI, lightning fast HMR and bundle compilation |
| **Styling** | **Tailwind CSS** | Utility-first, responsive, zero-runtime CSS overhead |
| **Containerization** | **Docker & Docker Compose** | Multi-stage unprivileged builds for both Backend and Frontend |
| **CI/CD** | **GitHub Actions** | Automated validation of syntax, builds, and Docker packaging |

---

## 📂 Project Directory Structure

```text
CatalogHub_cloudComputing/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI (lint, React build, Docker test)
├── client/                      # Frontend Application (Deploy to Cloudflare Pages)
│   ├── public/
│   │   ├── _redirects           # Cloudflare Pages SPA rewrite rules
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/          # Modular React components
│   │   │   ├── Navbar.jsx       # Header with live Cloud & DB status indicator
│   │   │   ├── SearchBar.jsx    # Real-time search with debounce & sorting
│   │   │   ├── CategoryFilter.jsx # Category pill selector
│   │   │   ├── ProductCard.jsx  # Responsive product card with stock badges
│   │   │   ├── AddProductModal.jsx # Validated modal for product creation
│   │   │   └── Toast.jsx        # Notification alert system
│   │   ├── services/
│   │   │   └── api.js           # Dynamic API client (local dev & production URL resolution)
│   │   ├── App.jsx              # Main React Application
│   │   ├── main.jsx             # React DOM root entry
│   │   └── index.css            # Tailwind CSS directives
│   ├── package.json             # React 18, Vite, Tailwind CSS, Lucide
│   ├── vite.config.js           # Vite build & local proxy config
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── Dockerfile               # Multi-stage Nginx Alpine container
│   ├── nginx.conf               # Nginx SPA & caching configuration
│   └── .dockerignore
├── server/                      # Backend API (Deploy to Railway.app)
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js           # Zod-validated environment configuration
│   │   │   └── database.js      # Knex database connection with auto-retry
│   │   ├── database/
│   │   │   ├── migrations/      # Knex schema migrations (Flyway equivalent)
│   │   │   │   └── 20240101000000_create_products_table.js
│   │   │   └── seeds/           # Initial sample data seeds
│   │   │       └── 01_seed_products.js
│   │   ├── controllers/         # HTTP request/response handlers
│   │   │   └── product.controller.js
│   │   ├── services/            # Pure business logic (SKU uniqueness, metrics)
│   │   │   └── product.service.js
│   │   ├── repositories/        # Knex database queries / Data Access Objects
│   │   │   └── product.repository.js
│   │   ├── schemas/             # Zod validation schemas
│   │   │   └── product.schema.js
│   │   ├── middlewares/         # Validation, Error, and Not Found middlewares
│   │   │   ├── validate.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── routes/              # Express API routers
│   │   │   ├── product.routes.js
│   │   │   └── index.js
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Bootstrap entrypoint (runs Knex migrations on boot)
│   ├── knexfile.js              # Knex migration and environment settings
│   ├── package.json             # Express, Knex, mysql2, Zod, Helmet
│   ├── Dockerfile               # Multi-stage unprivileged Node.js Alpine container
│   ├── railway.json             # Railway Nixpacks deployment configuration
│   └── .dockerignore
├── docs/                        # Complete course deliverables
│   ├── ARCHITECTURE.md          # Cloud architecture, design patterns, security, cost analysis
│   ├── RAILWAY_MYSQL_SETUP.md   # Step-by-step Railway + MySQL private network guide & troubleshooting
│   ├── CLOUDFLARE_PAGES_DEPLOY.md # Step-by-step Cloudflare Pages guide
│   └── TEST_AND_API_GUIDE.md    # Ready-to-run cURL test scenarios & API schema verification
├── docker-compose.yml           # Complete local fullstack orchestration
├── .gitignore                   # Monorepo gitignore
└── README.md                    # Project documentation
```

---

## 💻 Local Development Quickstart

### Option 1: Docker Compose (1 Command Fullstack)
```bash
docker compose up --build
```
* **Frontend:** [http://localhost:8080](http://localhost:8080)
* **Backend API:** [http://localhost:5000](http://localhost:5000)
* **MySQL:** `localhost:3306`

---

### Option 2: Running via Local Node.js

1. **Start Backend (Auto-runs Knex migrations on boot):**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Start Frontend (Vite React HMR):**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Manual Database Migration Commands (Knex):**
   ```bash
   cd server
   npm run migrate      # Run pending migrations (knex migrate:latest)
   npm run seed         # Populate seed data (knex seed:run)
   ```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Validation |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health, DB latency, and cloud provider telemetry | None |
| `GET` | `/api/products` | Search products with `?search=...&category=...&sortBy=...` | Zod Query Schema |
| `POST` | `/api/products` | Add a new product (checks SKU uniqueness) | Zod Body Schema |
| `GET` | `/api/products/categories` | Retrieve unique list of categories | None |


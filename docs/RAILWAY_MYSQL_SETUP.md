# 🚂 Step-by-Step Guide: Deploying NodeJS & MySQL on Railway.app

This guide provides exhaustive, step-by-step instructions for deploying the **CatalogHub Backend** and configuring a secure, private-networked **MySQL database** on [Railway.app](https://railway.app).

---

## 📑 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Create a Railway Project](#step-1-create-a-railway-project)
3. [Step 2: Provision MySQL Database Service](#step-2-provision-mysql-database-service)
4. [Step 3: Deploy NodeJS Backend Service](#step-3-deploy-nodejs-backend-service)
5. [Step 4: Configure Private Networking & Environment Variables](#step-4-configure-private-networking--environment-variables)
6. [Step 5: Generate Public Domain for API](#step-5-generate-public-domain-for-api)
7. [Step 6: Verification & Health Check](#step-6-verification--health-check)
8. [Knex.js Migration Lifecycle (Flyway Equivalent)](#8-knexjs-migration-lifecycle-flyway-equivalent)
9. [Troubleshooting & Common Cloud Issues](#9-troubleshooting--common-cloud-issues)

---

## 1. Prerequisites
* A [GitHub](https://github.com) account with this repository pushed.
* A [Railway.app](https://railway.app) account (login via GitHub recommended).

---

## Step 1: Create a Railway Project

1. Log in to [Railway Dashboard](https://railway.app/dashboard).
2. Click **`+ New Project`** in the top right corner.
3. Select **`Empty Project`**.
4. Name your project (e.g., `CatalogHub-Cloud`).

---

## Step 2: Provision MySQL Database Service

1. Inside your new project canvas, click **`+ Create`** (or press `Ctrl + K` / `Cmd + K`).
2. Select **`Database`** $\rightarrow$ **`Add MySQL`**.
3. Railway will spin up a dedicated MySQL 8 container in seconds.
4. Click on the newly created **MySQL** service card:
   * Navigate to the **Variables** tab.
   * You will see the auto-generated credentials:
     * `MYSQLHOST`: `mysql.railway.internal` (Internal DNS name)
     * `MYSQLPORT`: `3306`
     * `MYSQLUSER`: `root`
     * `MYSQLPASSWORD`: `<auto_generated_password>`
     * `MYSQLDATABASE`: `railway`
     * `MYSQL_URL`: Complete connection string URI

> 🛡️ **Zero-Trust Network Security:**
> Do **NOT** enable `TCP Proxy` under the *Networking* tab. By keeping it private, your database is physically inaccessible from the public internet, preventing brute force and port-scanning attacks.

---

## Step 3: Deploy NodeJS Backend Service

1. In the same project canvas, click **`+ Create`** $\rightarrow$ **`GitHub Repo`**.
2. Select your `CatalogHub_cloudComputing` repository.
3. Railway will add a service card. Click on it and go to **Settings**:
   * **Root Directory**: Set this to `/server`. *(Tells Railway to build only the backend folder).*
   * **Service Name**: `cataloghub-backend`

---

## Step 4: Configure Private Networking & Environment Variables

Because both services (NodeJS and MySQL) reside in the same Railway project, they can share environment variables dynamically using Railway Reference Variables.

1. Click on your **NodeJS backend** service.
2. Go to the **Variables** tab.
3. Click **`Add Variable`** (or `Raw Editor`) and configure:

| Variable Name | Recommended Value / Reference | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Runs NodeJS in production mode |
| `PORT` | `5000` | Port listened by Express |
| `CLIENT_ORIGIN` | `*` *(or your Cloudflare Pages URL)* | Allowed CORS origin |
| `MYSQLHOST` | `${{MySQL.MYSQLHOST}}` | References `mysql.railway.internal` |
| `MYSQLPORT` | `${{MySQL.MYSQLPORT}}` | References `3306` |
| `MYSQLUSER` | `${{MySQL.MYSQLUSER}}` | MySQL user |
| `MYSQLPASSWORD` | `${{MySQL.MYSQLPASSWORD}}` | MySQL password |
| `MYSQLDATABASE` | `${{MySQL.MYSQLDATABASE}}` | Target database name |

*(Alternatively, you can provide `MYSQL_URL` as `${{MySQL.MYSQL_URL}}`)*

4. Click **`Deploy`**. Railway will automatically trigger a Nixpacks build.

---

## Step 5: Generate Public Domain for API

1. In your **NodeJS backend** service, go to **Settings** $\rightarrow$ **Networking**.
2. Click **`Generate Domain`**.
3. Railway will assign a public HTTPS domain:
   `https://cataloghub-backend-production-xxxx.up.railway.app`
4. Copy this domain for configuring the Frontend on Cloudflare Pages.

---

## Step 6: Verification & Health Check

1. Open your browser and navigate to:
   ```text
   https://your-backend.up.railway.app/api/health
   ```
2. You will receive a `200 OK` JSON response:
   ```json
   {
     "status": "UP",
     "uptimeSeconds": 24,
     "database": {
       "status": "CONNECTED",
       "latencyMs": 2,
       "totalProducts": 6
     },
     "cloudPlatform": "Railway.app"
   }
   ```

---

## 8. Knex.js Migration Lifecycle (Flyway Equivalent)

When your NodeJS backend boots up on Railway, `server.js` automatically executes:
```javascript
await db.migrate.latest();
await db.seed.run();
```
* It reads the migration history table `knex_migrations`.
* It applies any pending migration files in `src/database/migrations/`.
* It populates seed products if the table is empty.
* You do **NOT** have to run any manual SQL commands in production!

---

## 9. Troubleshooting & Common Cloud Issues

### Issue 1: Database Connection Timeout on Cold Start (`ECONNREFUSED`)
* **Symptom:** During initial deployment, the backend logs might show a connection failure while connecting to `mysql.railway.internal:3306`.
* **Root Cause:** In containerized cloud platforms, the NodeJS service may finish building and boot up before the MySQL database container is fully initialized and accepting socket connections.
* **Solution in CatalogHub:** Our backend implements an exponential backoff retry mechanism in `server/src/config/database.js` (`assertDatabaseConnection`), which automatically retries up to 5 times at 3-second intervals before exiting.

### Issue 2: CORS Blocked from Cloudflare Pages
* **Symptom:** The browser console displays: `Access to fetch at ... has been blocked by CORS policy`.
* **Root Cause:** The backend does not permit the origin of your Cloudflare Pages frontend (`https://*.pages.dev`).
* **Solution:**
  1. In the Railway backend dashboard $\rightarrow$ **Variables**.
  2. Ensure `CLIENT_ORIGIN` is set to `*` or your specific Cloudflare Pages URL (e.g., `https://cataloghub-client.pages.dev`).
  3. Our Express backend also natively allows any origin ending with `.pages.dev`.

### Issue 3: Railway Builds the Wrong Folder
* **Symptom:** Railway displays `Cannot find module package.json` or tries to build from root.
* **Root Cause:** The `Root Directory` was left blank.
* **Solution:** In Railway $\rightarrow$ Click NodeJS service $\rightarrow$ **Settings** $\rightarrow$ **Root Directory** $\rightarrow$ Enter `/server` and save.

### Issue 4: How to View Live Server Logs
* In your Railway project, click on the **NodeJS service**.
* Click on the **Deployments** tab $\rightarrow$ select the active deployment $\rightarrow$ click **View Logs**.
* You will see the live output of Express startup, Knex migration execution, and HTTP request logs via Morgan.

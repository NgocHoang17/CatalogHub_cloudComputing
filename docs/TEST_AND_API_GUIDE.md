# 🧪 CatalogHub - Test & API Verification Guide

This guide provides exhaustive test scenarios, API specifications, and ready-to-run `cURL` commands for evaluating the two core features required by the project: **Product Addition** and **Product Search**.

---

## 📑 Core Capabilities Matrix

| Requirement | Endpoint | Method | Key Test Criteria |
| :--- | :--- | :--- | :--- |
| **Search Products** | `/api/products` | `GET` | Keyword search across SKU/name/description, category filtering, price/date sorting, pagination |
| **Add Product** | `/api/products` | `POST` | Zod schema validation, duplicate SKU prevention (409 Conflict), database persistence |
| **Health & Latency** | `/api/health` | `GET` | Live MySQL connection check, query latency measurement (ms), uptime, platform identification |

---

## 🚀 Ready-to-Run Test Scenarios (cURL)

> 💡 **Note:** Replace `https://your-backend.up.railway.app` with your actual Railway public domain, or use `http://localhost:5000` when testing locally.

### Scenario 1: Healthcheck & Database Telemetry
Verifies that the backend can communicate with MySQL over Railway's private network mesh (`railway.internal`).

```bash
curl -X GET "https://your-backend.up.railway.app/api/health" \
  -H "Accept: application/json"
```

**Expected Response (HTTP 200 OK):**
```json
{
  "status": "UP",
  "uptimeSeconds": 142,
  "database": {
    "status": "CONNECTED",
    "latencyMs": 2,
    "totalProducts": 6
  },
  "cloudPlatform": "Railway.app"
}
```

---

### Scenario 2: Search Products by Keyword (Core Feature)
Searches across product `name`, `sku`, and `description`.

```bash
curl -X GET "https://your-backend.up.railway.app/api/products?search=Gateway" \
  -H "Accept: application/json"
```

**Expected Response (HTTP 200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "sku": "NET-ROUTER-99",
      "name": "Dual-Band Mesh Cloud Gateway",
      "description": "Enterprise-grade mesh gateway with automated failover...",
      "category": "Networking",
      "price": "289.50",
      "stock": 42,
      "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=60",
      "created_at": "2026-11-07T13:00:00.000Z",
      "updated_at": "2026-11-07T13:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  }
}
```

---

### Scenario 3: Filter by Category & Sort by Price Ascending
Tests multi-parameter filtering and SQL ordering.

```bash
curl -X GET "https://your-backend.up.railway.app/api/products?category=Hardware&sortBy=price&order=ASC" \
  -H "Accept: application/json"
```

---

### Scenario 4: Add a New Product (Core Feature - Success Case)
Creates a new record in MySQL and immediately returns the created entity with database ID.

```bash
curl -X POST "https://your-backend.up.railway.app/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "EDGE-PRO-900",
    "name": "Cloud Edge Cluster Accelerator",
    "category": "Hardware",
    "price": 899.00,
    "stock": 25,
    "description": "Hardware evaluation node deployed during final project review."
  }'
```

**Expected Response (HTTP 201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 7,
    "sku": "EDGE-PRO-900",
    "name": "Cloud Edge Cluster Accelerator",
    "category": "Hardware",
    "price": "899.00",
    "stock": 25,
    "description": "Hardware evaluation node deployed during final project review.",
    "created_at": "2026-11-07T13:10:00.000Z"
  }
}
```

---

### Scenario 5: Duplicate SKU Conflict (Negative Test Case)
Attempts to add a product with an SKU that already exists in the database.

```bash
curl -X POST "https://your-backend.up.railway.app/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "EDGE-PRO-900",
    "name": "Duplicate Item",
    "price": 100.00
  }'
```

**Expected Response (HTTP 409 Conflict):**
```json
{
  "success": false,
  "message": "A product with SKU 'EDGE-PRO-900' already exists."
}
```

---

### Scenario 6: Input Validation Failure (Negative Test Case)
Tests Zod schema validation against negative pricing.

```bash
curl -X POST "https://your-backend.up.railway.app/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "INVALID-PRICE",
    "name": "Invalid Product",
    "price": -50.00
  }'
```

**Expected Response (HTTP 400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```


# ShopMicro — AI Microservices E-Commerce Platform

> A full-stack college demo project built with React, Node.js, TypeScript, PostgreSQL, Groq AI, and Pinecone — demonstrating real-world microservices architecture.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Pages & Routes](#pages--routes)
- [AI Integration](#ai-integration)
- [Demo Accounts](#demo-accounts)

---

## Overview

ShopMicro is a microservices-based e-commerce platform built as a college demo project. It demonstrates how large companies like Amazon and Netflix structure their backend — with each business domain running as an independent service with its own database. The platform features a full user-facing storefront and a separate admin dashboard, powered by Groq's LLM API for AI shopping assistance and Pinecone for semantic product search.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              React + Vite Frontend  :5173            │
│         (Store UI  +  Admin Dashboard)               │
└────────────────────┬────────────────────────────────┘
                     │ HTTP (proxied)
┌────────────────────▼────────────────────────────────┐
│              API Gateway  :3000                      │
│         Routes requests to correct service           │
└───┬────────┬─────────┬──────────┬───────────────────┘
    │        │         │          │          │
:3001     :3002     :3003      :3004      :3005
Product   Order    Payment  Inventory    Auth
Service   Service  Service   Service   Service
    │        │         │          │          │
products_ orders_  payments_ inventory_ auth_db
   db        db       db        db
```

Each microservice owns its own PostgreSQL database. They communicate only through the API Gateway — never directly with each other.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + Vite | UI framework and build tool |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Component library |
| React Router v6 | Client-side routing |
| Recharts | Dashboard charts |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | HTTP server for each service |
| TypeScript | Type safety |
| PostgreSQL | Relational database (one per service) |
| node-postgres (pg) | PostgreSQL client |
| JSON Web Tokens | Authentication |
| bcryptjs | Password hashing |
| nodemon + ts-node | Development hot reload |

### AI / External Services
| Service | Purpose |
|---------|---------|
| Groq API (llama-3.3-70b) | AI shopping assistant chat |
| Pinecone | Vector database for semantic product search |

---

## Project Structure

```
ecommerce-platform/
├── frontend/                        # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx   # Route guards (RequireAuth, RequireAdmin)
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx           # Admin sidebar layout
│   │   │   │   └── StoreLayout.tsx      # User storefront topbar layout
│   │   │   └── ui/                      # shadcn/ui components
│   │   ├── lib/
│   │   │   ├── api.ts                   # All API call functions
│   │   │   ├── authStore.ts             # Auth state + JWT management
│   │   │   └── cartStore.ts             # Per-user cart (localStorage)
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx        # Stats + charts
│   │   │   │   ├── Products.tsx         # Product CRUD
│   │   │   │   ├── Orders.tsx           # Order management
│   │   │   │   ├── Payments.tsx         # Payment tracking
│   │   │   │   ├── Inventory.tsx        # Stock management
│   │   │   │   ├── Categories.tsx       # Category CRUD
│   │   │   │   └── AIAssistant.tsx      # Groq chat (admin)
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── ForgotPassword.tsx
│   │   │   └── store/
│   │   │       ├── Home.tsx             # Hero + featured products
│   │   │       ├── Shop.tsx             # Product grid + filters
│   │   │       ├── Cart.tsx             # Shopping cart
│   │   │       ├── Checkout.tsx         # Card / UPI / Net Banking flow
│   │   │       ├── MyOrders.tsx         # User's order history
│   │   │       └── AIChat.tsx           # AI shopping assistant
│   │   └── App.tsx                      # Route configuration
│   ├── vite.config.ts                   # Vite + proxy config
│   └── tailwind.config.js
│
└── backend/
    ├── gateway/
    │   └── index.ts                     # API Gateway (port 3000)
    ├── services/
    │   ├── product-service/             # port 3001
    │   │   ├── index.ts
    │   │   ├── routes.ts
    │   │   ├── db.ts
    │   │   └── .env
    │   ├── order-service/               # port 3002
    │   ├── payment-service/             # port 3003
    │   ├── inventory-service/           # port 3004
    │   └── auth-service/                # port 3005
    ├── shared/
    │   ├── types.ts                     # Shared TypeScript interfaces
    │   ├── middleware.ts                # Error handler, request logger
    │   └── aiService.ts                 # Groq + Pinecone integration
    ├── package.json
    └── tsconfig.json
```

---

## Features

### User Storefront
- **Home** — Hero banner with search, featured products with inline quantity controls, shop-by-category grid
- **Shop** — Full product catalog with real-time search and category filter pills
- **Cart** — Per-user isolated cart (each user has their own cart in localStorage), quantity stepper, order summary with savings
- **Checkout** — Three real payment flows:
  - **Card** — 16-digit formatter, expiry, CVV toggle, live card preview, Visa/Mastercard/RuPay detection
  - **UPI** — UPI ID with quick-fill buttons (GPay, PhonePe, Paytm, BHIM), 6-digit MPIN
  - **Net Banking** — Bank selector (10 Indian banks), User ID + password
- **My Orders** — Order history filtered by logged-in user, order status progress tracker, cancel pending orders
- **AI Chat** — Groq-powered shopping assistant with conversation history and suggested prompts

### Admin Dashboard
- **Dashboard** — Stat cards (orders, revenue, products, stock), bar chart for order status, donut chart for payment breakdown, low stock alerts
- **Products** — Grid view with CRUD, search + category filter, stock badge overlay, image on hover edit/delete
- **Categories** — Create/delete categories with emoji picker and color theme selector, product count per category
- **Orders** — Table with status filter, inline status updater dropdown
- **Payments** — Transaction table with refund action
- **Inventory** — Stock levels with progress bars, update stock dialog, low stock alert banner
- **AI Assistant** — Groq chat with full product catalog context

### Authentication & Security
- JWT-based auth with 7-day expiry
- bcrypt password hashing (10 salt rounds)
- Role-based route guards (`RequireAuth`, `RequireAdmin`, `RedirectIfLoggedIn`)
- Admin routes completely inaccessible to regular users
- Token auto-attached to all API requests via Axios interceptor

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL (via pgAdmin)
- VS Code

### 1. Clone and set up folders

```bash
mkdir ecommerce-platform
cd ecommerce-platform
# frontend and backend folders are already structured
```

### 2. Create PostgreSQL databases

In pgAdmin, create these 5 databases:

```
products_db
orders_db
payments_db
inventory_db
auth_db
```

### 3. Run database schemas

For each database, run the corresponding SQL from the setup guide to create tables and seed initial data.

For `auth_db`, generate a password hash and insert the admin user:

```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log(h))"
```

Then in pgAdmin → `auth_db`:
```sql
INSERT INTO users (name, email, password, role)
VALUES ('Admin User', 'admin@shop.com', '<paste_hash_here>', 'admin');
```

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Configure environment variables

Create `.env` files for each service (see [Environment Variables](#environment-variables) below).

### 6. Start all backend services

Open 6 terminals and run one command in each:

```bash
npm run gateway    # Terminal 1 — port 3000
npm run product    # Terminal 2 — port 3001
npm run order      # Terminal 3 — port 3002
npm run payment    # Terminal 4 — port 3003
npm run inventory  # Terminal 5 — port 3004
npm run auth       # Terminal 6 — port 3005
```

### 7. Install and start frontend

```bash
cd frontend
npm install
npm run dev        # Starts at http://localhost:5173
```

---

## Environment Variables

### `backend/gateway/.env`
```env
PORT=3000
PRODUCT_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
INVENTORY_SERVICE_URL=http://localhost:3004
AUTH_SERVICE_URL=http://localhost:3005
```

### `backend/services/product-service/.env`
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=products_db
DB_USER=postgres
DB_PASSWORD=your_password
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=products-index
```

### `backend/services/order-service/.env`
```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=orders_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### `backend/services/payment-service/.env`
```env
PORT=3003
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payments_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### `backend/services/inventory-service/.env`
```env
PORT=3004
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### `backend/services/auth-service/.env`
```env
PORT=3005
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=shopmicro_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
```

---

## API Reference

All requests go through the API Gateway at `http://localhost:3000`.

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new account | None |
| POST | `/api/auth/login` | Login, returns JWT | None |
| GET | `/api/auth/me` | Get current user from token | Bearer token |
| POST | `/api/auth/logout` | Logout | Bearer token |

### Products — `/api/products`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products (supports `?search=` and `?category=`) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/ai/search?q=` | Semantic vector search via Pinecone |
| POST | `/api/products/ai/chat` | AI shopping assistant via Groq |

### Categories — `/api/categories`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category |
| DELETE | `/api/categories/:id` | Delete category |

### Orders — `/api/orders`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders (supports `?user_id=`) |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Place new order |
| PUT | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Cancel order |
| GET | `/api/orders/stats/summary` | Aggregated order stats |

### Payments — `/api/payments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List all payments |
| GET | `/api/payments/:id` | Get single payment |
| GET | `/api/payments/order/:orderId` | Get payment by order |
| POST | `/api/payments/process` | Process payment (90% success rate in demo) |
| PUT | `/api/payments/:id/refund` | Refund a payment |
| GET | `/api/payments/stats/summary` | Aggregated payment stats |

### Inventory — `/api/inventory`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List all inventory |
| GET | `/api/inventory/:productId` | Get stock for product |
| PUT | `/api/inventory/:productId/stock` | Set stock quantity |
| PUT | `/api/inventory/:productId/deduct` | Deduct stock after order |
| GET | `/api/inventory/alerts/low-stock` | Items below threshold |
| GET | `/api/inventory/stats/summary` | Aggregated inventory stats |

---

## Database Schema

### `auth_db` — users
```sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `products_db` — products
```sql
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  category    VARCHAR(100),
  image_url   TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### `products_db` — categories
```sql
CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) UNIQUE NOT NULL,
  emoji      VARCHAR(10) DEFAULT '📦',
  color      VARCHAR(50) DEFAULT 'bg-slate-100 text-slate-700',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `orders_db` — orders
```sql
CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  product_id  INTEGER NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status      VARCHAR(50) DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### `payments_db` — payments
```sql
CREATE TABLE payments (
  id             SERIAL PRIMARY KEY,
  order_id       INTEGER NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  status         VARCHAR(50) DEFAULT 'pending',
  method         VARCHAR(50) DEFAULT 'card',
  transaction_id VARCHAR(255) UNIQUE,
  created_at     TIMESTAMP DEFAULT NOW()
);
```

### `inventory_db` — inventory
```sql
CREATE TABLE inventory (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL UNIQUE,
  quantity   INTEGER NOT NULL DEFAULT 0,
  warehouse  VARCHAR(100) DEFAULT 'Main Warehouse',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Pages & Routes

### Public routes (no login required)
| Route | Page |
|-------|------|
| `/` | Home — hero + featured products |
| `/shop` | Shop — browse all products |
| `/cart` | Shopping cart |
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Reset password |

### Protected user routes (login required)
| Route | Page |
|-------|------|
| `/checkout` | Checkout with payment |
| `/my-orders` | Order history |
| `/ai-chat` | AI shopping assistant |

### Admin routes (admin role required)
| Route | Page |
|-------|------|
| `/admin` | Dashboard with charts |
| `/admin/products` | Product management |
| `/admin/categories` | Category management |
| `/admin/orders` | Order management |
| `/admin/payments` | Payment tracking |
| `/admin/inventory` | Stock management |
| `/admin/ai` | Admin AI assistant |

---

## AI Integration

### Groq — Shopping Assistant

The AI chat feature uses Groq's `llama-3.3-70b-versatile` model. When a user sends a message, the backend fetches the latest 20 products from the database and injects them as context into the system prompt, so the AI always has up-to-date product information to reference.

**Endpoint:** `POST /api/products/ai/chat`
```json
{ "message": "What electronics do you have under ₹3000?" }
```

### Pinecone — Semantic Search

Products are stored as 1024-dimensional vectors in Pinecone when they are created or updated. The semantic search feature converts a user query into a vector and finds the most similar products — going beyond exact keyword matching.

**Endpoint:** `GET /api/products/ai/search?q=wireless+headphones+for+gym`

To use Pinecone:
1. Create a free account at [pinecone.io](https://www.pinecone.io)
2. Create an index named `products-index` with dimension `1024` and metric `cosine`
3. Add your API key to the product service `.env`

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shop.com | admin123 |
| User | user@shop.com | user123 |

The admin account redirects to `/admin` after login. Regular users go to the storefront `/`. Attempting to access `/admin/*` as a regular user redirects back to `/`.

---

## Key Design Decisions

**Why 4 separate databases instead of 1?** This is the core of microservices architecture. Each service owning its own database means a failure in one service (e.g. the payment database going down) does not take down the product listing page. Services are truly independent and can be scaled, deployed, or maintained separately.

**Why JWT instead of sessions?** JWTs are stateless — the server does not need to store session data. The token contains the user's ID, email, and role, which is verified on every request without a database lookup.

**Why per-user cart in localStorage?** The cart is stored client-side with the key `cart_user_{id}`, so each user's cart is completely isolated. When a user logs in or out, `cartStore.reload()` is called to switch to the correct cart immediately.

**Why Groq over OpenAI?** Groq provides extremely fast inference (significantly lower latency) and has a generous free tier, making it ideal for a demo/college project.

---

## Running in Production

This project is configured for local development. For production deployment you would:

1. Add environment-specific `.env` files or use a secrets manager
2. Build the frontend with `npm run build` and serve the `dist/` folder
3. Compile TypeScript with `tsc` and run the compiled `dist/` output
4. Use a process manager like PM2 for the backend services
5. Set up a reverse proxy (Nginx) in front of the API Gateway
6. Replace the demo 90% payment success rate with a real payment gateway (Razorpay for India)

---

*Built as a college demo project · AI Microservices E-Commerce Platform*
<p align="center">
  <h1 align="center">🛒 POS App</h1>
  <p align="center">
    A modern, high-performance Point of Sale system built with<br/>
    <strong>Laravel 13</strong> · <strong>Inertia.js v3</strong> · <strong>React 19</strong> · <strong>Tailwind CSS v4</strong>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PHP-8.4-777BB4?logo=php&logoColor=white" alt="PHP 8.4"/>
  <img src="https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white" alt="Laravel 13"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Pest-4-F28D1A?logo=php&logoColor=white" alt="Pest 4"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"/>
</p>

---

## 📑 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Tech Stack](#-tech-stack)
- [Port Customization](#-port-customization)
- [Database Profiles (Docker)](#-database-profiles-docker)
- [Default Credentials](#-default-credentials)
- [Makefile Shortcuts](#-makefile-shortcuts)
- [Testing & Code Quality](#-testing--code-quality)
- [License](#-license)

---

## ✨ Features

### 🛍️ Point of Sale (POS)
- **Interactive POS Terminal** — Full-featured sales interface with product grid, real-time cart management, and instant checkout
- **Multiple Payment Methods** — Support for Cash, Credit Card, Debit Card, and PIX
- **Smart Cart** — Add/remove items, adjust quantities, and see live totals with discount calculations
- **Coupon System** — Apply percentage-based coupons with flexible scoping (global, per-category, or per-product)
- **Digital Receipt** — Auto-generated receipt with sale details, payment info, and change calculation
- **Stock Validation** — Real-time stock checks during checkout with pessimistic locking to prevent overselling

### 📊 Dashboard & Analytics
- **Revenue Metrics** — Total revenue, sales count, and average ticket at a glance
- **Payment Breakdown** — Visual breakdown of sales by payment method
- **Top Selling Products** — Ranked list of best-performing products
- **Low Stock Alerts** — Immediate visibility into products running low or out of stock
- **Recent Sales Feed** — Live feed of the latest transactions

### 📈 Reports & Exports
- **Advanced Filtering** — Filter reports by date range, payment method, category, or specific product
- **Sales Summary** — Total sales, revenue, discounts applied, and average ticket
- **Daily Sales Chart** — Day-by-day sales visualization
- **Export to CSV** — Download filtered sales data as spreadsheet
- **Export to PDF** — Generate professional PDF reports via DomPDF

### 📦 Inventory Management
- **Product Catalog** — Full CRUD for products with name, price, stock, image, and category
- **Category Management** — Organize products into categories
- **Supplier Management** — Track and manage product suppliers
- **Stock Tracking** — Automatic stock deduction on each sale

### 👥 Employee & User Management
- **Employee Profiles** — Manage employees with linked user accounts
- **Role-Based Access Control** — Admin and Employee roles with granular permissions via Spatie Permission
- **Role & Permission Management** — Create, edit, and assign roles and permissions from the UI

### 🔐 Authentication & Security
- **Laravel Fortify** — Login, registration, password reset, and email verification
- **Two-Factor Authentication (2FA)** — TOTP-based 2FA with QR codes and recovery codes
- **Profile Management** — Update name, email, and avatar with image cropping
- **Password Management** — Change password from security settings

### ⚙️ Settings & Personalization
- **Profile Settings** — Edit personal info and avatar
- **Security Settings** — Manage password and 2FA
- **Appearance** — Light/dark mode theme toggle

---

## 📋 Prerequisites

Depending on the setup method you pick:

| Method | Requirements |
|---|---|
| **Interactive wizard / Full Docker** | [Docker](https://www.docker.com/products/docker-desktop) & Docker Compose |
| **Manual local setup** | PHP **8.4+**, Composer **2+**, Node.js **22+**, npm |

> The interactive wizard (`./setup.sh`) checks all of these and can **install missing dependencies for you** (PHP, Composer, Node) via apt / Homebrew / winget after confirmation, or steer you to Docker. It also diagnoses Docker permission/daemon issues. Run `./setup.sh --dry-run` to preview the install plan without changing anything.

---

## ⚡ Quick Start

### Option 1 — Interactive Setup (Recommended)

A guided wizard that checks prerequisites (PHP, Node, Composer, Docker), then walks you through setup mode, database, mail, ports, and seeding — with a live progress spinner for each step:

```bash
make setup
# or, without make:
chmod +x setup.sh && ./setup.sh
```

That's it. When it finishes you'll get the URLs and default credentials.

---

### Option 2 — Full Docker (Zero Host Dependencies)

Docker installed and running? Stand up the whole stack manually:

```bash
# 1. Copy the environment template
cp .env.example .env

# 2. Prepare the SQLite database file (bind-mounted into the container)
touch database/database.sqlite

# 3. Build and start the application + mail services
docker compose up -d --build

# 4. Generate the app key and run migrations/seeds inside the container
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
```

| Service | URL |
|---|---|
| **Application** | [http://localhost:8000](http://localhost:8000) |
| **Vite Dev Server (HMR)** | [http://localhost:5173](http://localhost:5173) |
| **Mailpit Inbox** | [http://localhost:8025](http://localhost:8025) |

---

### Option 3 — Manual Local Setup

Prefer running everything natively:

```bash
# 1. Install dependencies
composer install
npm install

# 2. Configure environment
cp .env.example .env
php artisan key:generate

# 3. Setup SQLite database
touch database/database.sqlite
php artisan migrate:fresh --seed

# 4. Compile assets
npm run build

# 5. Start dev servers (two terminals, or `make dev` for both)
php artisan serve    # Terminal 1
npm run dev          # Terminal 2
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Laravel 13, PHP 8.4 |
| **Frontend** | React 19, Inertia.js v3, TypeScript |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Database** | SQLite · MySQL 8.0 · PostgreSQL 16 |
| **Authentication** | Laravel Fortify (2FA, Passkeys) |
| **Authorization** | Spatie Laravel-Permission |
| **PDF Generation** | Barryvdh DomPDF |
| **Email Testing** | Mailpit |
| **Testing** | Pest PHP 4, Larastan |
| **Code Style** | Laravel Pint, ESLint, Prettier |
| **Routing** | Laravel Wayfinder (typed route functions) |

---

## ⚙️ Port Customization

Ports are fully configurable via your `.env` file or dynamically through `./setup.sh`:

| Variable | Description | Default Port |
|---|---|---|
| `APP_PORT` | Main application HTTP server | `8000` |
| `VITE_PORT` | Vite Hot Module Replacement (HMR) | `5173` |
| `MAILPIT_PORT` | Mailpit dashboard Web UI | `8025` |

If you customize these values in `.env`, Docker Compose will automatically map them.

---

## 🗄️ Database Profiles (Docker)

SQLite is the default connection. If you wish to use other databases via Docker:

### MySQL 8.0
```bash
docker compose --profile mysql up -d
```
Update your `.env`:
```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pos_app
DB_USERNAME=root
DB_PASSWORD=password
```

### PostgreSQL 16
```bash
docker compose --profile postgres up -d
```
Update your `.env`:
```ini
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=pos_app
DB_USERNAME=postgres
DB_PASSWORD=password
```

---

## 👥 Default Credentials

When database seeds are run, the following users are generated:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@example.com` | `password` |
| **Staff/Employee** | `employee@example.com` | `password` |

> 15 additional fictitious employees are also seeded for testing.

---

## 🚀 Makefile Shortcuts

This project includes a `Makefile` with handy shortcuts. Run `make help` to see all available commands:

```bash
# Setup
make help            # Show all available commands
make install         # Install Composer + NPM dependencies
make setup           # Run interactive setup wizard

# Development
make dev             # Start Laravel + Vite dev servers in parallel
make serve           # Start Laravel dev server only
make vite            # Start Vite dev server only
make build           # Build frontend assets for production

# Database
make migrate         # Run database migrations
make fresh           # Reset database with migrations + seeders
make seed            # Run database seeders

# Quality
make test            # Run Pest test suite
make lint            # Format code with Laravel Pint
make lint-check      # Check formatting without fixing
make analyse         # Run Larastan static analysis
make check           # Run all quality checks (lint + test + analyse)

# Docker
make docker          # Start Docker services (app + mailpit)
make docker-build    # Build Docker images
make docker-down     # Stop Docker services
make docker-mysql    # Start with MySQL profile
make docker-postgres # Start with PostgreSQL profile
make docker-logs     # Follow Docker container logs

# Utilities
make optimize        # Cache config, routes, views, and events
make clear           # Clear all caches
make routes          # List all routes
make tinker          # Open Laravel Tinker REPL
make wayfinder       # Generate Wayfinder route functions
make queue           # Start queue worker
```

---

## 🧪 Testing & Code Quality

```bash
# Run test suite
make test

# Format code with Laravel Pint
make lint

# Run all quality checks at once (lint + test + static analysis)
make check
```

---

## 📄 License

The POS App is open-sourced software licensed under the [MIT license](LICENSE).

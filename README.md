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

## ✨ Features

- **Point of Sale** — Interactive terminal with product grid, live cart, stock validation, and instant checkout (Cash, Credit, Debit, PIX)
- **Coupons** — Percentage discounts scoped globally, per-category, or per-product
- **Dashboard** — Revenue metrics, payment breakdown, top products, low-stock alerts
- **Reports** — Filter by date/payment/category/product; export to CSV and PDF
- **Inventory** — Products, categories, suppliers, and automatic stock tracking
- **Employees & RBAC** — Admin/Employee roles and permissions via Spatie Permission
- **Auth** — Laravel Fortify with 2FA (TOTP), password reset, and email verification
- **Settings** — Profile, security, and light/dark theme

---

## 📋 Prerequisites

Pick **one** path:

- **Docker** — [Docker](https://www.docker.com/products/docker-desktop) & Docker Compose. Nothing else needed.
- **Local** — PHP **8.4+**, Composer **2+**, Node.js **22+**, and npm.

---

## ⚡ Installation

### Option A — Docker (recommended)

```bash
cp .env.example .env
touch database/database.sqlite
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
```

| Service | URL |
|---|---|
| **Application** | http://localhost:8000 |
| **Vite (HMR)** | http://localhost:5173 |
| **Mailpit Inbox** | http://localhost:8025 |

### Option B — Local

```bash
# 1. Dependencies
composer install
npm install

# 2. Environment
cp .env.example .env
php artisan key:generate

# 3. Database (SQLite)
touch database/database.sqlite
php artisan migrate:fresh --seed

# 4. Build assets
npm run build

# 5. Run dev servers
composer run dev
# ...or in two terminals:
#   php artisan serve
#   npm run dev
```

App runs at http://localhost:8000.

---

## 👥 Default Credentials

Created when the database is seeded:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@example.com` | `password` |
| **Staff/Employee** | `employee@example.com` | `password` |

> 15 additional demo employees are also seeded.

---

## 🗄️ Database Profiles (Docker)

SQLite is the default. To use MySQL or PostgreSQL instead:

```bash
docker compose --profile mysql up -d      # MySQL 8.0
docker compose --profile postgres up -d   # PostgreSQL 16
```

Then update `.env`:

```ini
# MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pos_app
DB_USERNAME=root
DB_PASSWORD=password

# PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=pos_app
DB_USERNAME=postgres
DB_PASSWORD=password
```

Ports are configurable in `.env` via `APP_PORT` (8000), `VITE_PORT` (5173), and `MAILPIT_PORT` (8025). Docker Compose maps them automatically.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Laravel 13, PHP 8.4 |
| **Frontend** | React 19, Inertia.js v3, TypeScript |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Database** | SQLite · MySQL 8.0 · PostgreSQL 16 |
| **Auth** | Laravel Fortify (2FA, Passkeys) |
| **Authorization** | Spatie Laravel-Permission |
| **PDF** | Barryvdh DomPDF |
| **Email Testing** | Mailpit |
| **Testing** | Pest PHP 4, Larastan |
| **Code Style** | Laravel Pint, ESLint, Prettier |
| **Routing** | Laravel Wayfinder (typed route functions) |

---

## 🧪 Testing & Code Quality

```bash
php artisan test        # Run the Pest test suite
composer run lint       # Format code with Laravel Pint
composer run ci:check   # Lint + format + types + tests
```

---

## 📄 License

Open-sourced software licensed under the [MIT license](LICENSE).

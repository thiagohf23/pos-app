<p align="center">
  <img src="./public/images/logos/logo.png" alt="POS App Logo" width="150" height="auto"/>
</p>

  <p align="center">
    A modern, high-performance Point of Sale system built with<br/>
    <strong>Laravel 13</strong> · <strong>Inertia.js v3</strong> · <strong>React 19</strong> · <strong>Tailwind CSS v4</strong>
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
- [Installation](#-installation)
- [Tech Stack](#-tech-stack)
- [Default Credentials](#-default-credentials)
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
- **Keyboard Shortcuts** — Comprehensive keyboard navigation: `F2` search, arrow keys navigate products, `Enter` add to cart, `F8` checkout, `Alt+N` clear cart, `F3` coupon, number keys for payment methods, `Esc` cancel

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
- **Multi-Language Support** — Full i18n integration (Portuguese, English, Spanish) with persistent language switcher in navbar

---

## 📋 Prerequisites

- PHP **8.4+**
- Composer **2+**
- Node.js **22+** and npm

---

## ⚡ Installation

```bash
# 1. Clone and enter the project
git clone https://github.com/thiagohf23/pos-app.git
cd pos-app

# 2. Copy the environment template
cp .env.example .env

# 3. Install dependencies
composer install
npm install

# 4. Generate the app key
php artisan key:generate

# 5. Create the SQLite database and run migrations + seeds
touch database/database.sqlite
php artisan migrate:fresh --seed

# 6. Start the dev servers
composer run dev
```

App runs at [http://localhost:8000](http://localhost:8000).

> `composer run dev` starts Laravel and Vite together. Prefer separate terminals? Run `php artisan serve` and `npm run dev`. For production assets, use `npm run build`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Laravel 13, PHP 8.4 |
| **Frontend** | React 19, Inertia.js v3, TypeScript |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Database** | SQLite |
| **Authentication** | Laravel Fortify (2FA, Passkeys) |
| **Authorization** | Spatie Laravel-Permission |
| **PDF Generation** | Barryvdh DomPDF |
| **Testing** | Pest PHP 4, Larastan |
| **Code Style** | Laravel Pint, ESLint, Prettier |
| **Routing** | Laravel Wayfinder (typed route functions) |

---

## 👥 Default Credentials

When database seeds are run, the following users are generated:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@example.com` | `password` |
| **Staff/Employee** | `employee@example.com` | `password` |

> 15 additional fictitious employees are also seeded for testing.

---

## 🧪 Testing & Code Quality

```bash
php artisan test        # Run the Pest test suite
composer run lint       # Format code with Laravel Pint
composer run ci:check   # Lint + format + types + tests
```

---

## 📄 License

The POS App is open-sourced software licensed under the [MIT license](LICENSE).

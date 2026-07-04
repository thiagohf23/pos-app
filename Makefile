.PHONY: help install dev build test lint fresh seed clean docker docker-down

# Default target
help: ## Show this help message
	@echo ""
	@echo "  POS App — Available Commands"
	@echo "  ──────────────────────────────────────"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Setup ──────────────────────────────────────────

install: ## Install all dependencies (Composer + NPM)
	composer install
	npm install

setup: ## Run interactive setup wizard
	bash setup.sh

# ─── Development ────────────────────────────────────

dev: ## Start dev servers (Vite + Laravel in parallel)
	npx concurrently --kill-others \
		"php artisan serve" \
		"npm run dev" \
		--names "laravel,vite" \
		--prefix-colors "blue,green" \
	|| (echo "Tip: install concurrently with 'npm i -D concurrently', or run servers manually" && exit 1)

serve: ## Start Laravel dev server only
	php artisan serve

vite: ## Start Vite dev server only
	npm run dev

build: ## Build frontend assets for production
	npm run build

# ─── Database ───────────────────────────────────────

migrate: ## Run database migrations
	php artisan migrate

fresh: ## Fresh migrate + seed (reset database)
	php artisan migrate:fresh --seed

seed: ## Run database seeders
	php artisan db:seed

# ─── Quality ────────────────────────────────────────

test: ## Run Pest test suite
	php artisan test --compact

lint: ## Run Laravel Pint code formatter
	vendor/bin/pint

lint-check: ## Check code formatting without fixing
	vendor/bin/pint --test

analyse: ## Run Larastan static analysis
	vendor/bin/phpstan analyse

check: lint test analyse ## Run all quality checks (lint + test + analyse)

# ─── Docker ─────────────────────────────────────────

docker: ## Start all Docker services (app + mailpit)
	docker compose up -d

docker-build: ## Build Docker images
	docker compose build

docker-down: ## Stop all Docker services
	docker compose down

docker-mysql: ## Start with MySQL profile
	docker compose --profile mysql up -d

docker-postgres: ## Start with PostgreSQL profile
	docker compose --profile postgres up -d

docker-logs: ## Follow Docker container logs
	docker compose logs -f

# ─── Utilities ──────────────────────────────────────

optimize: ## Cache config, routes, views, and events
	php artisan optimize

clear: ## Clear all caches (config, routes, views, events)
	php artisan optimize:clear

routes: ## List all routes
	php artisan route:list

tinker: ## Open Laravel Tinker REPL
	php artisan tinker

wayfinder: ## Generate Wayfinder route functions
	php artisan wayfinder:generate

queue: ## Start queue worker
	php artisan queue:work --sleep=3 --tries=3

#!/usr/bin/env bash

set -e

# Graceful CTRL+C handling
cleanup() {
    printf '\033[?25h' # restore cursor
    echo -e "\n\n\033[0;33m⚠ Setup cancelled by user.\033[0m"
    exit 130
}
trap cleanup SIGINT SIGTERM
trap 'printf "\033[?25h"' EXIT

# Styling helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# Hide/show terminal cursor (restored on exit)
hide_cursor() { printf '\033[?25l'; }
show_cursor() { printf '\033[?25h'; }

# Helper for formatted headers
print_header() {
    clear
    echo
    echo -e "  ${MAGENTA}${BOLD}██████╗  ██████╗ ███████╗${NC}   ${GRAY}Point of Sale${NC}"
    echo -e "  ${MAGENTA}${BOLD}██╔══██╗██╔═══██╗██╔════╝${NC}   ${GRAY}Interactive Setup Wizard${NC}"
    echo -e "  ${MAGENTA}${BOLD}██████╔╝██║   ██║███████╗${NC}"
    echo -e "  ${MAGENTA}${BOLD}██╔═══╝ ██║   ██║╚════██║${NC}   ${DIM}Let's get you up and running.${NC}"
    echo -e "  ${MAGENTA}${BOLD}██║     ╚██████╔╝███████║${NC}"
    echo -e "  ${MAGENTA}${BOLD}╚═╝      ╚═════╝ ╚══════╝${NC}"
    echo
}

print_section() {
    echo
    echo -e "  ${CYAN}${BOLD}▸ $1${NC}"
    echo -e "  ${GRAY}────────────────────────────────────────────────${NC}"
}

# Status line helpers
ok()   { echo -e "  ${GREEN}✔${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
err()  { echo -e "  ${RED}✘${NC} $1"; }
hint() { echo -e "      ${GRAY}↳ $1${NC}"; }
step() { echo -e "\n  ${BLUE}${BOLD}▶ $1${NC}"; }

# Run a command silently with an animated spinner. Shows ✔/✘ on completion.
# Usage: run_step "Message" command args...
run_step() {
    local msg=$1
    shift
    local log
    log=$(mktemp)
    local frames='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'

    hide_cursor
    ( "$@" >"$log" 2>&1 ) &
    local pid=$!
    local i=0
    while kill -0 "$pid" 2>/dev/null; do
        local f=${frames:i++%${#frames}:1}
        printf "\r  ${CYAN}%s${NC} %s" "$f" "$msg"
        sleep 0.1
    done
    local code=0
    wait "$pid" || code=$?
    show_cursor

    if [ "$code" -eq 0 ]; then
        printf "\r  ${GREEN}✔${NC} %s\033[K\n" "$msg"
        rm -f "$log"
        return 0
    else
        printf "\r  ${RED}✘${NC} %s\033[K\n" "$msg"
        echo -e "  ${RED}${BOLD}Command failed. Output:${NC}"
        sed 's/^/      /' "$log"
        rm -f "$log"
        return "$code"
    fi
}

# Styled prompt. Usage: ask "Question" default_value  -> result in $REPLY_VAL
ask() {
    local q=$1
    local default=$2
    local input
    read -r -p "$(echo -e "  ${BOLD}?${NC} ${q} ${GRAY}[${default}]${NC} ${CYAN}➜${NC} ")" input
    REPLY_VAL=${input:-$default}
}

print_header

# 1. Prerequisites Check
print_section "Prerequisites Check"
HAS_PREREQS=true

# Check PHP
if command -v php >/dev/null 2>&1; then
    PHP_VER=$(php -r 'echo PHP_VERSION;')
    if php -r "exit(version_compare(PHP_VERSION, '8.4.0', '>=') ? 0 : 1);" >/dev/null 2>&1; then
        ok "PHP ${GREEN}${PHP_VER}${NC}"
    else
        err "PHP ${PHP_VER} ${GRAY}(8.4+ required)${NC}"
        hint "Upgrade: https://www.php.net/downloads.php"
        HAS_PREREQS=false
    fi
else
    err "PHP — not found"
    hint "Install: ${CYAN}sudo apt install php-cli php-xml php-sqlite3 php-mysql php-pgsql php-gd php-zip php-bcmath php-curl${NC}"
    HAS_PREREQS=false
fi

# Check Composer
if command -v composer >/dev/null 2>&1; then
    COMPOSER_VER=$(composer --version 2>/dev/null | head -1 | grep -oP '\d+\.\d+\.\d+')
    ok "Composer ${GREEN}${COMPOSER_VER}${NC}"
else
    err "Composer — not found"
    hint "Install: ${CYAN}curl -sS https://getcomposer.org/installer | php && sudo mv composer.phar /usr/local/bin/composer${NC}"
    HAS_PREREQS=false
fi

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VER=$(node -v)
    NODE_MAJOR=$(echo "$NODE_VER" | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 20 ]; then
        ok "Node.js ${GREEN}${NODE_VER}${NC}"
    else
        err "Node.js ${NODE_VER} ${GRAY}(20+ required)${NC}"
        hint "Use nvm or download from https://nodejs.org/"
        HAS_PREREQS=false
    fi
else
    err "Node.js — not found"
    hint "Install: ${CYAN}curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs${NC}"
    HAS_PREREQS=false
fi

# Check Docker (optional but highly recommended)
HAS_DOCKER=true
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    ok "Docker & Docker Compose"
else
    warn "Docker — not running or not found"
    hint "Install Docker Desktop: https://www.docker.com/products/docker-desktop"
    HAS_DOCKER=false
fi

# 2. Setup Mode Selection
print_section "Setup Mode"
echo -e "    ${BOLD}1${NC}  🐳 ${GREEN}Full Docker${NC}  ${GRAY}zero host config, recommended${NC}"
echo -e "    ${BOLD}2${NC}  💻 ${YELLOW}Local Dev${NC}    ${GRAY}runs directly on host${NC}"
echo
ask "Choose setup mode (1-2)" "1"
SETUP_MODE=$REPLY_VAL

if [ "$SETUP_MODE" = "1" ]; then
    if [ "$HAS_DOCKER" = "false" ]; then
        echo
        err "${BOLD}Docker is required for Full Docker mode.${NC}"
        hint "Install or start Docker, then re-run — or pick option 2 (Local Dev)."
        exit 1
    fi
fi

# Port Customization Question
print_section "Ports"
PORT_APP=8000
PORT_VITE=5173
PORT_MAILPIT=8025

echo -e "    ${BOLD}1${NC}  Keep defaults ${GRAY}(App 8000 · Vite 5173 · Mailpit 8025)${NC}"
echo -e "    ${BOLD}2${NC}  Customize"
echo
ask "Choose (1-2)" "1"
PORT_CHOICE=$REPLY_VAL

if [ "$PORT_CHOICE" = "2" ]; then
    echo
    ask "App port" "8000";     PORT_APP=$REPLY_VAL
    ask "Vite HMR port" "5173"; PORT_VITE=$REPLY_VAL
    ask "Mailpit UI port" "8025"; PORT_MAILPIT=$REPLY_VAL
fi

# 3. Mode configurations
DB_CONN="sqlite"
START_DB_DOCKER="no"
START_MAIL_DOCKER="yes"
RUN_SEEDERS="yes"

if [ "$SETUP_MODE" = "2" ]; then
    if [ "$HAS_PREREQS" = "false" ]; then
        echo
        err "${BOLD}Missing host dependencies (PHP, Composer, Node.js) for Local Dev.${NC}"
        hint "Install them first, or pick option 1 (Docker)."
        exit 1
    fi

    # Database Selection
    print_section "Database"
    echo -e "    ${BOLD}1${NC}  🗄  SQLite      ${GRAY}zero config, default${NC}"
    echo -e "    ${BOLD}2${NC}  🐬 MySQL"
    echo -e "    ${BOLD}3${NC}  🐘 PostgreSQL"
    echo
    ask "Choose database (1-3)" "1"
    DB_CHOICE=$REPLY_VAL

    case "$DB_CHOICE" in
        2)
            DB_CONN="mysql"
            ;;
        3)
            DB_CONN="pgsql"
            ;;
        *)
            DB_CONN="sqlite"
            ;;
    esac

    # Docker DB container (Local + MySQL/Postgres only)
    if [ "$DB_CONN" != "sqlite" ] && [ "$HAS_DOCKER" = "true" ]; then
        print_section "Database Container"
        echo -e "  Start the ${BOLD}${DB_CONN}${NC} database inside Docker?"
        echo -e "    ${BOLD}1${NC}  Yes  ${GRAY}starts container in background${NC}"
        echo -e "    ${BOLD}2${NC}  No   ${GRAY}I run my own DB server on the host${NC}"
        echo
        ask "Choose (1-2)" "1"
        if [ "$REPLY_VAL" = "1" ]; then
            START_DB_DOCKER="yes"
        fi
    fi

    # Mailpit
    if [ "$HAS_DOCKER" = "true" ]; then
        print_section "Mailpit"
        echo -e "  Start Mailpit ${GRAY}(local email testing)${NC} via Docker?"
        echo -e "    ${BOLD}1${NC}  Yes  ${GRAY}recommended${NC}"
        echo -e "    ${BOLD}2${NC}  No   ${GRAY}use log mailer${NC}"
        echo
        ask "Choose (1-2)" "1"
        if [ "$REPLY_VAL" = "2" ]; then
            START_MAIL_DOCKER="no"
        fi
    fi
fi

# Seeders
print_section "Demo Data"
echo -e "  Seed the database with demo data?"
echo -e "    ${BOLD}1${NC}  Yes  ${GRAY}recommended${NC}"
echo -e "    ${BOLD}2${NC}  No"
echo
ask "Choose (1-2)" "1"
if [ "$REPLY_VAL" = "2" ]; then
    RUN_SEEDERS="no"
fi

# Helper function to replace env values portably
update_env_var() {
    local key=$1
    local value=$2
    local file=".env"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS requires an empty string argument for in-place editing with sed -i
        sed -i "" "s|^${key}=.*|${key}=${value}|" "$file"
    else
        sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    fi
}

apply_custom_ports() {
    update_env_var "APP_PORT" "${PORT_APP}"
    update_env_var "VITE_PORT" "${PORT_VITE}"
    update_env_var "MAILPIT_PORT" "${PORT_MAILPIT}"
    # Update APP_URL inside .env if custom APP_PORT is used
    if [ "$PORT_APP" != "80" ] && [ "$PORT_APP" != "8000" ]; then
        update_env_var "APP_URL" "http://localhost:${PORT_APP}"
    fi
}

# Poll a Docker Compose service until its healthcheck reports "healthy".
# Usage: wait_for_healthy <service> <max_seconds>
wait_for_healthy() {
    local service=$1
    local max=${2:-60}
    local frames='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local elapsed=0
    local i=0

    hide_cursor
    while [ "$elapsed" -lt "$max" ]; do
        local status
        status=$(docker compose ps --format '{{.Health}}' "$service" 2>/dev/null | head -1)
        if [ "$status" = "healthy" ]; then
            show_cursor
            printf "\r  ${GREEN}✔${NC} %s is ready\033[K\n" "$service"
            return 0
        fi
        local f=${frames:i++%${#frames}:1}
        printf "\r  ${CYAN}%s${NC} Waiting for %s to be ready ${GRAY}(%ss)${NC}" "$f" "$service" "$elapsed"
        sleep 1
        elapsed=$((elapsed + 1))
    done
    show_cursor
    printf "\r  ${YELLOW}⚠${NC} %s not healthy after %ss — continuing anyway\033[K\n" "$service" "$max"
    return 1
}

# 4. Summary & Execution
print_header
echo -e "  ${GREEN}${BOLD}▶ Starting installation${NC}"
echo -e "  ${GRAY}────────────────────────────────────────────────${NC}"

if [ "$SETUP_MODE" = "1" ]; then
    step "Environment configuration"
    if [ ! -f .env ]; then
        cp .env.example .env
        ok ".env created from .env.example"
    else
        warn ".env already exists — skipping copy"
    fi
    # Apply ports in .env so Docker Compose picks them up
    apply_custom_ports

    # SQLite file must exist on the host: the .:/app bind mount shadows the
    # copy baked into the image, so migrate:fresh would otherwise fail.
    if [ ! -f database/database.sqlite ]; then
        touch database/database.sqlite
        ok "database/database.sqlite created"
    fi

    step "Docker images"
    run_step "Building images (first run may take a few minutes)" \
        env APP_PORT=$PORT_APP VITE_PORT=$PORT_VITE MAILPIT_PORT=$PORT_MAILPIT docker compose build

    step "Containers"
    run_step "Starting app + mailpit" \
        env APP_PORT=$PORT_APP VITE_PORT=$PORT_VITE MAILPIT_PORT=$PORT_MAILPIT docker compose up -d app mailpit

    step "Laravel setup"
    run_step "Generating APP_KEY" \
        env APP_PORT=$PORT_APP VITE_PORT=$PORT_VITE MAILPIT_PORT=$PORT_MAILPIT docker compose exec -T app php artisan key:generate --no-interaction

    if [ "$RUN_SEEDERS" = "yes" ]; then
        run_step "Migrating & seeding database" \
            env APP_PORT=$PORT_APP VITE_PORT=$PORT_VITE MAILPIT_PORT=$PORT_MAILPIT docker compose exec -T app php artisan migrate:fresh --seed --no-interaction
    else
        run_step "Migrating database" \
            env APP_PORT=$PORT_APP VITE_PORT=$PORT_VITE MAILPIT_PORT=$PORT_MAILPIT docker compose exec -T app php artisan migrate --no-interaction
    fi

    echo
    echo -e "  ${GREEN}${BOLD}🎉  Setup complete!${NC}"
    echo -e "  ${GRAY}────────────────────────────────────────────────${NC}"
    echo -e "    ${BOLD}App${NC}      ${BLUE}${BOLD}http://localhost:${PORT_APP}${NC}"
    echo -e "    ${BOLD}Vite${NC}     ${BLUE}${BOLD}http://localhost:${PORT_VITE}${NC}"
    echo -e "    ${BOLD}Mailpit${NC}  ${BLUE}${BOLD}http://localhost:${PORT_MAILPIT}${NC}"
    echo
    echo -e "    ${GRAY}Admin${NC}  ${BOLD}admin@example.com${NC} / ${BOLD}password${NC}"
    echo -e "    ${GRAY}Staff${NC}  ${BOLD}employee@example.com${NC} / ${BOLD}password${NC}"
    echo

else
    step "Environment configuration"
    if [ ! -f .env ]; then
        cp .env.example .env
        ok ".env created from .env.example"
    else
        warn ".env already exists — skipping copy"
    fi

    # Adjust .env file based on selections
    update_env_var "DB_CONNECTION" "${DB_CONN}"
    apply_custom_ports

    if [ "$DB_CONN" = "sqlite" ]; then
        touch database/database.sqlite
        ok "SQLite database ready (database/database.sqlite)"
    else
        warn "Check host, username & password for ${DB_CONN} in .env manually"
    fi

    if [ "$START_MAIL_DOCKER" = "no" ]; then
        update_env_var "MAIL_MAILER" "log"
    fi

    step "PHP dependencies"
    run_step "Installing Composer packages" composer install

    run_step "Generating APP_KEY" php artisan key:generate --no-interaction

    # Start database if requested via Docker
    if [ "$START_DB_DOCKER" = "yes" ]; then
        step "Database container"
        # Map Laravel connection name -> compose service/profile
        DB_PORT=3306
        DB_SERVICE="mysql"
        if [ "$DB_CONN" = "pgsql" ]; then
            DB_PORT=5432
            DB_SERVICE="postgres"
        fi
        run_step "Starting ${DB_SERVICE} container" \
            env DB_PORT=$DB_PORT docker compose --profile "$DB_SERVICE" up -d "$DB_SERVICE"
        wait_for_healthy "$DB_SERVICE" 90
    fi

    # Start mailpit if requested via Docker
    if [ "$START_MAIL_DOCKER" = "yes" ]; then
        step "Mailpit container"
        run_step "Starting Mailpit" \
            env MAILPIT_PORT=$PORT_MAILPIT docker compose up -d mailpit
    fi

    step "Database migrations"
    if [ "$RUN_SEEDERS" = "yes" ]; then
        run_step "Migrating & seeding" php artisan migrate:fresh --seed --no-interaction
    else
        run_step "Migrating" php artisan migrate --no-interaction
    fi

    step "Frontend assets"
    run_step "Installing Node modules" npm install
    run_step "Building assets" npm run build

    echo
    echo -e "  ${GREEN}${BOLD}🎉  Setup complete!${NC}"
    echo -e "  ${GRAY}────────────────────────────────────────────────${NC}"
    echo -e "  Start the dev servers ${GRAY}(or run ${CYAN}make dev${GRAY})${NC}:"
    echo -e "    ${YELLOW}Terminal 1${NC}  ${CYAN}npm run dev${NC}"
    echo -e "    ${YELLOW}Terminal 2${NC}  ${CYAN}php artisan serve --port=${PORT_APP}${NC}"
    echo
    echo -e "    ${BOLD}App${NC}      ${BLUE}${BOLD}http://localhost:${PORT_APP}${NC}"
    echo -e "    ${BOLD}Mailpit${NC}  ${BLUE}${BOLD}http://localhost:${PORT_MAILPIT}${NC}"
    echo
    echo -e "    ${GRAY}Admin${NC}  ${BOLD}admin@example.com${NC} / ${BOLD}password${NC}"
    echo -e "    ${GRAY}Staff${NC}  ${BOLD}employee@example.com${NC} / ${BOLD}password${NC}"
    echo
fi

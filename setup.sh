#!/usr/bin/env bash

set -e

# Parse CLI args
DRY_RUN=0
for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=1 ;;
        -h|--help)
            echo "Usage: ./setup.sh [--dry-run]"
            echo "  --dry-run   Detect platform and print the install plan without executing."
            exit 0
            ;;
    esac
done

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

# Detect OS platform and available package manager.
# Sets PLATFORM (linux|mac|wsl|win) and PKG_MGR (apt|brew|winget|none).
detect_platform() {
    local uname_s
    uname_s=$(uname -s 2>/dev/null || echo unknown)
    case "$uname_s" in
        MINGW*|MSYS*|CYGWIN*) PLATFORM="win" ;;
        Darwin)               PLATFORM="mac" ;;
        Linux)
            if grep -qiE "microsoft" /proc/version 2>/dev/null; then
                PLATFORM="wsl"
            else
                PLATFORM="linux"
            fi
            ;;
        *) PLATFORM="linux" ;;
    esac

    if command -v apt-get >/dev/null 2>&1; then
        PKG_MGR="apt"
    elif command -v brew >/dev/null 2>&1; then
        PKG_MGR="brew"
    elif command -v winget >/dev/null 2>&1; then
        PKG_MGR="winget"
    else
        PKG_MGR="none"
    fi
}

# Prints the human-readable install command(s) for a dependency on the current PKG_MGR.
describe_install() {
    local dep=$1
    case "$dep:$PKG_MGR" in
        php:apt)
            echo "sudo add-apt-repository -y ppa:ondrej/php   # only if 8.4 missing from repos"
            echo "sudo apt-get install -y php8.4-cli php8.4-xml php8.4-sqlite3 php8.4-mysql php8.4-pgsql php8.4-gd php8.4-zip php8.4-bcmath php8.4-curl php8.4-mbstring"
            ;;
        php:brew)     echo "brew install php" ;;
        composer:apt) echo "curl -sS https://getcomposer.org/installer | php   (then move to /usr/local/bin/composer)" ;;
        composer:brew)   echo "brew install composer" ;;
        composer:winget) echo "winget install --id Composer.Composer -e" ;;
        node:apt)     echo "curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -  &&  sudo apt-get install -y nodejs" ;;
        node:brew)    echo "brew install node@24" ;;
        node:winget)  echo "winget install --id OpenJS.NodeJS.LTS -e" ;;
        *)            echo "(no automated installer for ${dep} on ${PKG_MGR})" ;;
    esac
}

install_php() {
    case "$PKG_MGR" in
        apt)
            if ! apt-cache show php8.4-cli >/dev/null 2>&1; then
                sudo add-apt-repository -y ppa:ondrej/php
                sudo apt-get update
            fi
            sudo apt-get install -y php8.4-cli php8.4-xml php8.4-sqlite3 \
                php8.4-mysql php8.4-pgsql php8.4-gd php8.4-zip \
                php8.4-bcmath php8.4-curl php8.4-mbstring
            ;;
        brew) brew install php ;;
    esac
}

install_composer() {
    case "$PKG_MGR" in
        apt)
            curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
            php /tmp/composer-setup.php --install-dir=/tmp --filename=composer
            sudo mv /tmp/composer /usr/local/bin/composer
            rm -f /tmp/composer-setup.php
            ;;
        brew)   brew install composer ;;
        winget) winget install --id Composer.Composer -e ;;
    esac
}

install_node() {
    case "$PKG_MGR" in
        apt)
            curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        brew)   brew install node@24 ;;
        winget) winget install --id OpenJS.NodeJS.LTS -e ;;
    esac
}

# Prints the ordered install plan for MISSING_DEPS.
build_install_plan() {
    local dep
    for dep in php composer node; do
        case " ${MISSING_DEPS[*]} " in
            *" $dep "*)
                echo -e "  ${BOLD}${dep}${NC}"
                describe_install "$dep" | sed 's/^/      /'
                ;;
        esac
    done
}

# Offers to install missing system dependencies. Exits 1 if unresolved.
offer_install() {
    # No supported package manager → manual hint.
    if [ "$PKG_MGR" = "none" ]; then
        err "${BOLD}Missing dependencies and no supported package manager detected.${NC}"
        hint "Install manually: ${MISSING_DEPS[*]}"
        build_install_plan
        exit 1
    fi

    # PHP on native Windows is fragile → steer to Docker.
    if [ "$PLATFORM" = "win" ]; then
        case " ${MISSING_DEPS[*]} " in
            *" php "*)
                err "${BOLD}PHP is required and native Windows PHP setup is unreliable.${NC}"
                hint "Re-run and choose option 1 (Full Docker) — it needs no host PHP/Node."
                exit 1
                ;;
        esac
    fi

    print_section "Install Missing Dependencies"
    echo -e "  The following will be installed with ${BOLD}${PKG_MGR}${NC}:"
    build_install_plan
    echo
    ask "Install now? (y/n)" "y"
    if [ "$REPLY_VAL" != "y" ] && [ "$REPLY_VAL" != "Y" ]; then
        err "Dependencies required for Local Dev. Aborting."
        hint "Install them manually (see commands above) or re-run and pick Full Docker."
        exit 1
    fi

    # Prime sudo OUTSIDE the spinner so the password prompt is visible.
    if [ "$PKG_MGR" = "apt" ]; then
        echo
        echo -e "  ${GRAY}Requesting sudo access...${NC}"
        sudo -v || { err "sudo required to install packages."; exit 1; }
    fi

    step "Installing dependencies"
    local dep
    for dep in php composer node; do
        case " ${MISSING_DEPS[*]} " in
            *" $dep "*)
                if ! "install_${dep}"; then
                    err "Failed to install ${dep}."
                    hint "Install it manually and re-run:"
                    build_install_plan
                    exit 1
                fi
                ;;
        esac
    done

    # Re-check to confirm resolution (recheck mode skips Docker remediation).
    run_prereq_checks recheck
    if [ "${#MISSING_DEPS[@]}" -ne 0 ]; then
        err "${BOLD}Still missing after install: ${MISSING_DEPS[*]}${NC}"
        hint "Install manually and re-run:"
        if [ "$PLATFORM" = "win" ]; then
            hint "On Windows, newly installed tools may need a fresh terminal — reopen your shell and re-run."
        fi
        build_install_plan
        exit 1
    fi
    ok "All system dependencies satisfied."
}

# Classifies Docker availability into DOCKER_STATE: ok | absent | denied | stopped.
check_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        DOCKER_STATE="absent"
        return
    fi
    local out
    if out=$(docker info 2>&1); then
        DOCKER_STATE="ok"
        return
    fi
    if echo "$out" | grep -qiE "permission denied|docker.sock"; then
        DOCKER_STATE="denied"
    else
        DOCKER_STATE="stopped"
    fi
}

# Offers to add the current user to the 'docker' group (Linux/WSL only).
offer_docker_group_fix() {
    case "$PLATFORM" in
        linux|wsl) ;;
        *) return ;;
    esac
    ask "Add your user to the 'docker' group now? (y/n)" "n"
    if [ "$REPLY_VAL" = "y" ] || [ "$REPLY_VAL" = "Y" ]; then
        sudo usermod -aG docker "$USER" \
            && ok "Added ${USER} to 'docker' group." \
            || { err "Failed to modify group."; return; }
        warn "${BOLD}You must run 'newgrp docker' or log out/in for this to take effect.${NC}"
        warn "This shell still lacks access — re-run setup afterwards to use Docker mode."
    fi
}

# Runs the prerequisites check, prints results, and populates MISSING_DEPS.
run_prereq_checks() {
    local recheck="${1:-}"
    print_section "Prerequisites Check"
    HAS_PREREQS=true
    MISSING_DEPS=()

    # PHP
    if command -v php >/dev/null 2>&1; then
        PHP_VER=$(php -r 'echo PHP_VERSION;')
        if php -r "exit(version_compare(PHP_VERSION, '8.4.0', '>=') ? 0 : 1);" >/dev/null 2>&1; then
            ok "PHP ${GREEN}${PHP_VER}${NC}"
        else
            err "PHP ${PHP_VER} ${GRAY}(8.4+ required)${NC}"
            hint "Upgrade: https://www.php.net/downloads.php"
            HAS_PREREQS=false
            MISSING_DEPS+=("php")
        fi
    else
        err "PHP — not found"
        HAS_PREREQS=false
        MISSING_DEPS+=("php")
    fi

    # Composer
    if command -v composer >/dev/null 2>&1; then
        COMPOSER_VER=$(composer --version 2>/dev/null | head -1 | grep -oP '\d+\.\d+\.\d+')
        ok "Composer ${GREEN}${COMPOSER_VER}${NC}"
    else
        err "Composer — not found"
        HAS_PREREQS=false
        MISSING_DEPS+=("composer")
    fi

    # Node.js (minimum v22; install target v24 LTS)
    if command -v node >/dev/null 2>&1; then
        NODE_VER=$(node -v)
        NODE_MAJOR=$(echo "$NODE_VER" | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_MAJOR" -ge 22 ]; then
            ok "Node.js ${GREEN}${NODE_VER}${NC}"
        else
            err "Node.js ${NODE_VER} ${GRAY}(22+ required)${NC}"
            hint "Use nvm or download from https://nodejs.org/"
            HAS_PREREQS=false
            MISSING_DEPS+=("node")
        fi
    else
        err "Node.js — not found"
        HAS_PREREQS=false
        MISSING_DEPS+=("node")
    fi

    # Docker (optional but recommended). Skipped on post-install re-check so the
    # docker-group remediation prompt never fires mid-install.
    if [ "$recheck" != "recheck" ]; then
        check_docker
        case "$DOCKER_STATE" in
            ok)
                HAS_DOCKER=true
                ok "Docker & Docker Compose"
                ;;
            absent)
                HAS_DOCKER=false
                warn "Docker — not found"
                hint "Install Docker Desktop: https://www.docker.com/products/docker-desktop"
                ;;
            denied)
                HAS_DOCKER=false
                warn "Docker — installed but permission denied ${GRAY}(user not in 'docker' group)${NC}"
                hint "Fix: ${CYAN}sudo usermod -aG docker \$USER${NC}"
                hint "Then run ${CYAN}newgrp docker${NC} (or log out/in) and re-run this setup."
                offer_docker_group_fix
                ;;
            stopped)
                HAS_DOCKER=false
                warn "Docker — installed but the daemon is not running"
                if [ "$PLATFORM" = "mac" ] || [ "$PLATFORM" = "win" ]; then
                    hint "Start Docker Desktop, then re-run."
                else
                    hint "Start it: ${CYAN}sudo systemctl start docker${NC}"
                fi
                ;;
        esac
    fi
}

print_header
detect_platform
run_prereq_checks

if [ "$DRY_RUN" = "1" ]; then
    print_section "Dry Run — Install Plan"
    echo -e "  Platform: ${BOLD}${PLATFORM}${NC}"
    echo -e "  Package manager: ${BOLD}${PKG_MGR}${NC}"
    if [ "${#MISSING_DEPS[@]}" -eq 0 ]; then
        ok "No missing dependencies."
    elif [ "$PKG_MGR" = "none" ]; then
        warn "Missing: ${MISSING_DEPS[*]} — no supported package manager, manual install required."
    else
        echo -e "  Missing: ${BOLD}${MISSING_DEPS[*]}${NC}"
        echo -e "  ${GRAY}Would run:${NC}"
        build_install_plan
    fi
    exit 0
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
        offer_install
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

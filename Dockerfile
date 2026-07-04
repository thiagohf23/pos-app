FROM php:8.4-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libpq-dev \
    zip \
    unzip \
    curl \
    supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_sqlite pdo_mysql pdo_pgsql mbstring xml gd zip bcmath \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 & npm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy dependency files first
COPY package.json package-lock.json composer.json composer.lock ./

# Install dependencies (composer + npm)
RUN composer install --no-scripts --no-autoloader --prefer-dist \
    && npm ci

# Copy application files
COPY . .

# Finish composer setup
RUN composer dump-autoload --optimize

# Build frontend assets
RUN npm run build

# Setup SQLite database placeholder and permissions
RUN touch database/database.sqlite \
    && mkdir -p storage/framework/{cache,sessions,testing,views} storage/logs \
    && chmod -R 775 storage bootstrap/cache

# Copy supervisord config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8000 5173

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

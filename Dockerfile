# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM php:8.2-apache
RUN apt-get update && apt-get install -y --no-install-recommends \
        unzip git libgmp-dev \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && docker-php-ext-install gmp \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*
COPY apache/recipe.conf /etc/apache2/conf-available/recipe.conf
RUN a2enconf recipe
COPY backend/ /srv/backend/
COPY --from=frontend /app/dist/ /var/www/html/
WORKDIR /srv/backend
RUN composer install --no-dev --no-interaction --prefer-dist \
    && chown -R www-data:www-data /var/www /srv

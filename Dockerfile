# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM php:8.2-apache
RUN apt-get update && apt-get install -y --no-install-recommends \
        unzip git libgmp-dev libjpeg62-turbo-dev libpng-dev libwebp-dev \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install gd gmp \
    && a2enmod rewrite \
    && a2enmod headers \
    && rm -rf /var/lib/apt/lists/*
COPY apache/recipe.conf /etc/apache2/conf-available/recipe.conf
RUN a2enconf recipe
COPY backend/ /srv/backend/
COPY --from=frontend /app/dist/ /var/www/html/
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
WORKDIR /srv/backend
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && printf 'date.timezone = Europe/Budapest\nupload_max_filesize = 20M\npost_max_size = 25M\nmax_file_uploads = 10\n' > /usr/local/etc/php/conf.d/recipe.ini \
    && composer install --no-dev --no-interaction --prefer-dist \
    && chown -R www-data:www-data /var/www /srv

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

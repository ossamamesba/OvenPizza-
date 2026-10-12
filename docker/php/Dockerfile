FROM php:8.3-fpm

# Extensions nécessaires à Symfony + Doctrine (MySQL)
# gd + exif : optimisation des photos des pizzas (WebP, redimensionnement, orientation)
RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip libicu-dev libzip-dev libjpeg62-turbo-dev libpng-dev libwebp-dev \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install intl pdo_mysql zip opcache gd exif \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY php.ini /usr/local/etc/php/conf.d/app.ini

# Aligne l'utilisateur du conteneur sur celui de l'hôte (WSL/Linux)
# pour que les fichiers créés dans backend/ restent modifiables.
ARG UID=1000
ARG GID=1000
RUN groupmod -o -g ${GID} www-data && usermod -o -u ${UID} www-data

ENV COMPOSER_HOME=/tmp/composer
WORKDIR /var/www/backend
USER www-data

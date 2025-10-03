ARG SYMFONY_PARAMS="MockApp"

FROM php:8.2-apache

RUN apt update && apt install -y \
    libicu-dev \
    libonig-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    git \
    postgresql-client \
    libpq-dev \
    && git config --global user.email "you@example.com" && git config --global user.name "Your Name" \
    && docker-php-ext-configure intl \
    && docker-php-ext-install intl \
    && docker-php-ext-install mbstring \
    && docker-php-ext-install zip \
    && docker-php-ext-install pdo_pgsql

RUN docker-php-ext-enable intl mbstring zip pdo_pgsql

COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV SYMFONY_PARAMS_STD="MockApp"

RUN curl -1sLf 'https://dl.cloudsmith.io/public/symfony/stable/setup.deb.sh' | bash && apt install -y symfony-cli

WORKDIR /usr/src
VOLUME /usr/src

COPY ./docker/php/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

CMD sh -c "composer install;composer require nelmio/cors-bundle;php bin/console doctrine:database:create --if-not-exists;php bin/console doctrine:migrations:migrate --no-interaction;apache2-foreground"

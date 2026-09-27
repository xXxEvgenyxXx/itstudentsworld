FROM php:8.4-fpm-alpine

# Устанавливаем системные зависимости и расширения PHP
RUN apk add --no-cache \
    nginx \
    libzip-dev \
    icu-dev \
    && docker-php-ext-install pdo pdo_mysql zip intl opcache

# Устанавливаем Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

ENV COMPOSER_PROCESS_TIMEOUT=600
ENV COMPOSER_ALLOW_SUPERUSER=1

# Конфиг Nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

WORKDIR /var/www/html

# 1) Копируем только composer-файлы, чтобы кэшировать слой зависимостей
COPY composer.json composer.lock ./

# 2) Ставим зависимости БЕЗ скриптов (artisan-а пока нет)
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --prefer-dist \
    --no-interaction \
    --no-scripts

# 3) Копируем ВЕСЬ проект (теперь есть artisan, bootstrap/, config/ и т.д.)
COPY . .

# 4) Вот теперь скрипты Laravel можно запустить — artisan на месте
RUN composer dump-autoload --optimize --no-interaction

# Права на директории
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8000

CMD php-fpm -D && nginx -g "daemon off;"

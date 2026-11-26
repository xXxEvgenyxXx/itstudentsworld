# Мир студента IT

Веб-приложение для игрового RP-сервера Minecraft с модом **Minecraft Transit Railway (MTR)**. Проект представляет собой полноценную платформу для управления электронной коммерцией: игроки могут регистрироваться, просматривать каталог внутриигровой косметики (железнодорожная форма, уникальные плащи), пополнять баланс и совершать покупки.

## Архитектура проекта

/backend - REST API на Laravel. Разделен на контроллеры, сервисы (бизнес-логика) и модели. Строгая валидация через FormRequest.

/frontend — SPA на React. Организован по методологии FSD:

- app - роутинг и провайдеры.

- pages - страницы (Главная, Магазин, Профиль, Админка).

- widgets - крупные UI-блоки (Header, Footer, Таблицы).

- features - действия пользователя (покупка, настройка cookie).

- entities - бизнес-сущности (User, Cosmetic, Transaction).

- shared - переиспользуемые компоненты и утилиты.

## Стек технологий, которые используются в проекте:

**Frontend:**
*   React 18 (TypeScript, strict mode)
*   Vite (сборщик)
*   Ant Design (UI-компоненты)
*   TanStack Query (управление серверным состоянием)
*   Zustand (управление клиентским состоянием)
*   Zod (валидация данных)
*   Feature-Sliced Design (FSD) архитектура

**Backend:**
*   Laravel 11 (PHP 8.2)
*   Laravel Sanctum (аутентификация)
*   MySQL 8.0
*   Pest / PHPUnit (тестирование)

**Инфраструктура:**
*   Docker / Docker Compose
*   Nginx

## Запуск проекта (Docker)

Для запуска проекта вам понадобятся только установленные **Docker Desktop** (с поддержкой WSL2 для Windows) и **Git**.

### Шаг 1. Клонирование репозитория
```bash
git clone https://github.com/xXxEvgenyxXx/itstudentsworld.git
cd itstudentsworld
```
### Шаг 2. Настройка переменных окружения

```bash
# Корень (для Docker Compose)
cp .env.example .env

# Бэкенд (Laravel)
cp backend/.env.example backend/.env

# Фронтенд (Vite)
cp frontend/.env.example frontend/.env
```

В корневом .env проверьте настройки базы данных:

```
DB_DATABASE=itsw
DB_USERNAME=user
DB_PASSWORD=secret
MYSQL_ROOT_PASSWORD=rootsecret
```

### Шаг 3. Сборка и запуск контейнеров

Запустите Docker Compose. При первом запуске скачаются образы и соберутся контейнеры:

```bash
docker compose up -d --build
```

### Шаг 4. Инициализация бэкенда

После того как контейнеры поднимутся, сгенерируйте ключ приложения, установите зависимости, выполните миграции и выполните сиды данных:

```bash
# Генерация ключа шифрования Laravel
docker compose exec backend php artisan key:generate

# Установка зависимостей
docker compose exec backend php composer install

# Миграции
docker compose exec backend php artisan migrate

# Сид данных
docker compose exec backend php artisan db:seed
```

### Шаг 5. Доступ к приложению:

Frontend: localhost:5173

Backend: localhost:8000

## Тестирование

Проект покрыт автотестами (более 150 тестов на всех уровнях). Для запуска используйте следующие команды:

Тесты бэкенда (PHPUnit) (перед запуском проверьте, что контейнеры запущены):

```bash
docker compose exec backend php artisan test
```

Юнит- и интеграционные тесты фронтенда (Vitest) (не требуют запуска контейнеров):

```bash
npm run test:frontend
```

E2E-тесты (Cypress) (перед запуском проверить, что контейнеры проекта запущены!!!):

```bash
npm run cy:open
```
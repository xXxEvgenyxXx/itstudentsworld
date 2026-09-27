COMPOSE = docker compose

GREEN = \033[0;32m
YELLOW = \033[0;33m
RESET = \033[0m

.PHONY: help
help:
	@echo "$(GREEN)Доступные команды:$(RESET)"
	@echo "  make up          - Собрать и запустить все сервисы"
	@echo "  make down        - Остановить контейнеры"
	@echo "  make logs        - Показать логи"
	@echo "  make shell-back  - Зайти в shell бэкенда"
	@echo "  make shell-front - Зайти в shell фронтенда"
	@echo "  make shell-db    - Зайти в MySQL контейнер"
	@echo "  make migrate     - Запустить миграции Laravel"
	@echo "  make fresh       - Полная пересборка с нуля (с удалением БД)"
	@echo "  make import-dump - Импортировать dump.sql из docker/mysql/init/"

.PHONY: up
up:
	$(COMPOSE) up --build -d
	@echo "$(GREEN)✔ Сервисы запущены$(RESET)"
	@echo "$(YELLOW)  Фронтенд: http://localhost:5173$(RESET)"
	@echo "$(YELLOW)  Бэкенд:   http://localhost:8000$(RESET)"
	@echo "$(YELLOW)  MySQL:    localhost:3306$(RESET)"

.PHONY: down
down:
	$(COMPOSE) down

.PHONY: logs
logs:
	$(COMPOSE) logs -f

.PHONY: shell-back
shell-back:
	$(COMPOSE) exec backend sh

.PHONY: shell-front
shell-front:
	$(COMPOSE) exec frontend sh

.PHONY: shell-db
shell-db:
	$(COMPOSE) exec db mysql -u root -p

.PHONY: migrate
migrate:
	$(COMPOSE) exec backend php artisan migrate

.PHONY: fresh
fresh:
	$(COMPOSE) down -v --remove-orphans
	$(COMPOSE) up --build -d
	@echo "$(GREEN)✔ Проект пересобран с нуля$(RESET)"

.PHONY: import-dump
import-dump:
	@if [ ! -f docker/mysql/init/dump.sql ]; then \
		echo "$(YELLOW)Положите дамп в docker/mysql/init/dump.sql$(RESET)"; \
		exit 1; \
	fi
	$(COMPOSE) exec -T db mysql -u root -p$$MYSQL_ROOT_PASSWORD itsw < docker/mysql/init/dump.sql
	@echo "$(GREEN)✔ Дамп импортирован в БД itsw$(RESET)"
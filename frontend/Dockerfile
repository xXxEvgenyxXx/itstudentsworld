# --- Этап 1: Сборка ---
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем package.json и lock-файл для кэширования слоев
COPY package*.json ./
RUN npm ci

# Копируем все исходники и собираем проект
COPY . .
RUN npm run build

# --- Этап 2: Production ---
FROM nginx:alpine

# Копируем собранные статические файлы из первого этапа
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем кастомный конфиг Nginx (создадим ниже)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
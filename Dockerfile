# ЛР 18 (Задание 2): Оптимизированный многоступенчатый Dockerfile
# Этап 1: Сборка приложения (build)
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Устанавливаем инструменты сборки для компиляции нативного пакета bcrypt на Alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Удаляем devDependencies перед переносом в production-образ
RUN npm prune --omit=dev

# Этап 2: Финальный легковесный образ (production)
FROM node:20-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]

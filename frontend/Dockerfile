# ====================================
# 頸椎分析系統 - 前端 Dockerfile
# Multi-stage: React Build + Nginx
# GCP Cloud Run 部署用
# ====================================

# Stage 1: Build React App
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY public/ ./public/
COPY src/ ./src/

# 透過 build arg 設定後端 API URL
ARG REACT_APP_BASE_URL=http://localhost:8083/
ENV REACT_APP_BASE_URL=${REACT_APP_BASE_URL}

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine

# 複製自訂 nginx 設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 從 build 階段複製產出物
COPY --from=build /app/build /usr/share/nginx/html

# Cloud Run 使用 PORT 環境變數，預設 8080
# nginx 設定會使用 envsubst 動態替換 port
ENV PORT=8080

EXPOSE 8080

# 使用 envsubst 動態替換 nginx 設定中的 PORT
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf > /tmp/default.conf && mv /tmp/default.conf /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"

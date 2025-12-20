# ========================================
# 階段 1: 建置前端 React 應用程式
# ========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# 複製前端 package.json 與 package-lock.json
COPY spine-client/package*.json ./

# 安裝前端依賴
RUN npm ci

# 複製前端原始碼
COPY spine-client/ ./

# 設定生產環境變數（Docker 部署時前端與後端在同一域名，使用根路徑）
ARG REACT_APP_BASE_URL=/
ENV REACT_APP_BASE_URL=${REACT_APP_BASE_URL}

# 建置前端
RUN npm run build

# ========================================
# 階段 2: 建置後端 Node.js 應用程式
# ========================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# 複製後端 package.json 與 package-lock.json
COPY spine-server/package*.json ./

# 安裝後端依賴（僅生產環境依賴）
RUN npm ci --only=production

# ========================================
# 階段 3: 生產環境映像檔
# ========================================
FROM node:20-alpine AS production

# 設定工作目錄
WORKDIR /app

# 安裝 dumb-init 以正確處理信號
RUN apk add --no-cache dumb-init

# 建立非 root 用戶以增加安全性
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# 複製後端依賴與原始碼
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY spine-server/src ./src

# 複製前端建置產物到 public 目錄
COPY --from=frontend-builder /app/frontend/build ./public

# 建立 logs 目錄並設定權限
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# 設定環境變數
ENV NODE_ENV=production
# Cloud Run 會設定 PORT 環境變數，預設為 8080
ENV PORT=8080

# 切換到非 root 用戶
USER nodejs

# 暴露埠號（Cloud Run 使用 PORT 環境變數）
EXPOSE 8080

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# 使用 dumb-init 啟動應用程式
CMD ["dumb-init", "node", "src/index.js"]

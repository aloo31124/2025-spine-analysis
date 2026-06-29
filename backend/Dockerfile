# ====================================
# 頸椎分析系統 - 後端 Dockerfile
# GCP Cloud Run 部署用
# ====================================
FROM node:20-alpine

WORKDIR /app

# 複製 package 檔案並安裝依賴
COPY package*.json ./
RUN npm ci --only=production

# 複製原始碼 (包含 firestroekey.json)
COPY src/ ./src/
# 注意：.env 不納入映像檔。環境變數（NODE_ENV、EMAIL_USER、EMAIL_PASSWORD 等）
# 一律由 Cloud Run --set-env-vars / Secret Manager 注入；dotenv 在無 .env 時會自動退回 process.env。

# Cloud Run 使用 PORT 環境變數，預設 8083
ENV PORT=8083
ENV NODE_ENV=production

EXPOSE 8083

CMD ["node", "src/index.js"]

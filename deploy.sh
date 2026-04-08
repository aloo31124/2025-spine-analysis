#!/bin/bash
# ====================================
# 頸椎分析系統 - GCP 自動部署腳本 (Linux/Mac)
# ====================================
# 使用方式: chmod +x deploy.sh && ./deploy.sh
# 前置需求: 安裝 gcloud CLI 並已登入

set -e

REGION="${1:-asia-east1}"
SERVER_SERVICE="spine-server"
CLIENT_SERVICE="spine-client"

echo "============================================"
echo "  頸椎分析系統 - GCP Cloud Run 自動部署"
echo "============================================"
echo ""

# 取得 GCP 專案 ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "[錯誤] 請先設定 GCP 專案: gcloud config set project <PROJECT_ID>"
    exit 1
fi
echo "[資訊] GCP 專案: $PROJECT_ID"
echo "[資訊] 部署區域: $REGION"
echo ""

# 啟用必要的 GCP API
echo "[1/7] 啟用 GCP API 服務..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com --quiet

# 建置後端 Docker Image
echo "[2/7] 建置後端 Docker Image..."
gcloud builds submit ./spine-server \
    --tag "gcr.io/$PROJECT_ID/$SERVER_SERVICE:latest" \
    --quiet

# 部署後端至 Cloud Run
echo "[3/7] 部署後端至 Cloud Run..."
gcloud run deploy $SERVER_SERVICE \
    --image "gcr.io/$PROJECT_ID/$SERVER_SERVICE:latest" \
    --region $REGION \
    --platform managed \
    --port 8083 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --allow-unauthenticated \
    --set-env-vars "NODE_ENV=production" \
    --quiet

# 取得後端 URL
echo "[4/7] 取得後端服務 URL..."
SERVER_URL=$(gcloud run services describe $SERVER_SERVICE --region $REGION --format 'value(status.url)')
echo "[資訊] 後端 URL: $SERVER_URL"

# 建置前端 Docker Image (帶入後端 URL)
echo "[5/7] 建置前端 Docker Image..."
cat > /tmp/_cloudbuild_temp.yaml << EOF
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'REACT_APP_BASE_URL=${SERVER_URL}/'
      - '-t'
      - 'gcr.io/$PROJECT_ID/$CLIENT_SERVICE:latest'
      - '.'
images:
  - 'gcr.io/$PROJECT_ID/$CLIENT_SERVICE:latest'
EOF

gcloud builds submit ./spine-client --config /tmp/_cloudbuild_temp.yaml --quiet
rm -f /tmp/_cloudbuild_temp.yaml

# 部署前端至 Cloud Run
echo "[6/7] 部署前端至 Cloud Run..."
gcloud run deploy $CLIENT_SERVICE \
    --image "gcr.io/$PROJECT_ID/$CLIENT_SERVICE:latest" \
    --region $REGION \
    --platform managed \
    --port 8080 \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 5 \
    --allow-unauthenticated \
    --quiet

# 取得前端 URL
CLIENT_URL=$(gcloud run services describe $CLIENT_SERVICE --region $REGION --format 'value(status.url)')

# 完成
echo ""
echo "============================================"
echo "  [7/7] 部署完成！"
echo "============================================"
echo ""
echo "  前端網址: $CLIENT_URL"
echo "  後端 API: $SERVER_URL"
echo "  Swagger:  $SERVER_URL/api/docs"
echo ""
echo "  Firestore 連接: 使用原有 firestroekey.json (已包含於 Image)"
echo ""

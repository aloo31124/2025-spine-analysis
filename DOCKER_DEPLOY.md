# Docker 部署指南 - GCP Cloud Run

本文件說明如何使用 Docker 建置並部署專案到 GCP Cloud Run。

## 專案結構

```
├── Dockerfile              # Docker 映像檔設定
├── .dockerignore          # Docker 建置排除檔案
├── docker-compose.yml     # 本地開發/測試用
├── cloudbuild.yaml        # GCP Cloud Build 自動部署設定
├── spine-client/          # React 前端
└── spine-server/          # Node.js + Express 後端
```

## 前置需求

- Docker Desktop 已安裝
- GCP 帳號與專案
- gcloud CLI 已安裝並登入

## 本地測試

### 使用 Docker Compose

```bash
# 建置並啟動
docker-compose up --build

# 在背景執行
docker-compose up -d --build

# 停止服務
docker-compose down
```

服務啟動後，開啟瀏覽器訪問：http://localhost:8080

### 使用 Docker 直接建置

```bash
# 建置映像檔
docker build -t spine-analysis:latest .

# 執行容器
docker run -p 8080:8080 -e PORT=8080 spine-analysis:latest
```

## 部署到 GCP Cloud Run

### 方法一：使用 gcloud CLI 手動部署

```bash
# 1. 設定專案 ID
export PROJECT_ID=your-gcp-project-id

# 2. 設定 Docker 使用 GCP Container Registry
gcloud auth configure-docker

# 3. 建置映像檔
docker build -t gcr.io/$PROJECT_ID/spine-analysis:latest \
  --build-arg REACT_APP_BASE_URL=/

# 4. 推送映像檔到 Container Registry
docker push gcr.io/$PROJECT_ID/spine-analysis:latest

# 5. 部署到 Cloud Run
gcloud run deploy spine-analysis \
  --image gcr.io/$PROJECT_ID/spine-analysis:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --port 8080
```

### 方法二：使用 Cloud Build 自動部署

```bash
# 使用 Cloud Build 建置並部署
gcloud builds submit --config cloudbuild.yaml
gcloud builds submit --config cloudbuild.yaml \
gcloud builds submit --config [cloudbuild.yaml](http://_vscodecontentref_/5) --substitutions=COMMIT_SHA=latest
  --substitutions=_REGION=us-central1
```

### 方法三：設定 Cloud Build 觸發器（CI/CD）

1. 進入 GCP Console → Cloud Build → Triggers
2. 建立新觸發器，連接您的 Git 儲存庫
3. 設定觸發條件（如 push to main branch）
4. 選擇使用 `cloudbuild.yaml` 設定檔

## 環境變數設定

### 必要環境變數

| 變數名稱 | 說明 | 預設值 |
|---------|------|-------|
| `PORT` | 服務監聽埠號 | 8080 |
| `NODE_ENV` | 執行環境 | production |

### Firestore 認證

Cloud Run 會自動使用服務帳戶進行 Firestore 認證。確保：

1. Cloud Run 服務帳戶具有 Firestore 存取權限
2. 或設定 `GOOGLE_APPLICATION_CREDENTIALS` 環境變數指向金鑰檔案

```bash
# 在 Cloud Run 中設定環境變數
gcloud run services update spine-analysis \
  --set-env-vars="NODE_ENV=production" \
  --region us-central1
```

## 健康檢查

應用程式提供健康檢查端點：

- **端點**: `GET /api/health`
- **回應**: `{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}`

## 常見問題

### Q: 建置時出現記憶體不足錯誤

A: React 建置需要較多記憶體，可在 Docker Desktop 中增加記憶體配額。

### Q: Cloud Run 部署後無法存取 Firestore

A: 確認 Cloud Run 服務帳戶具有 `Cloud Datastore User` 或 `Firebase Admin` 角色。

### Q: 前端 API 請求失敗

A: 確認前端建置時的 `REACT_APP_BASE_URL` 設定正確（應為 `/api/`）。

## 相關指令速查

```bash
# 查看 Cloud Run 服務狀態
gcloud run services describe spine-analysis --region us-central1

# 查看日誌
gcloud run services logs read spine-analysis --region us-central1

# 刪除服務
gcloud run services delete spine-analysis --region us-central1

# 列出所有映像檔
gcloud container images list --repository=gcr.io/$PROJECT_ID
```

# 頸椎分析系統 - Docker + GCP Cloud Run 部署指南

## 📋 架構總覽

```
┌─────────────────────────────────────────────────┐
│                  GCP Cloud Run                   │
│                                                  │
│  ┌──────────────┐       ┌──────────────────┐    │
│  │ spine-client │──────▶│  spine-server    │    │
│  │  (Nginx)     │  API  │  (Node.js 20)   │    │
│  │  Port: 8080  │       │  Port: 8083     │    │
│  └──────────────┘       └───────┬──────────┘    │
│                                  │               │
│                          ┌───────▼──────────┐   │
│                          │    Firestore      │   │
│                          │ (firestroekey.json)│  │
│                          └──────────────────┘   │
└─────────────────────────────────────────────────┘
```

## 🔄 對應關係

| 原始 Firebase 環境 | → | GCP Cloud Run 環境 |
|---|---|---|
| Firebase Cloud Functions | → | Cloud Run (spine-server) |
| Firebase Hosting | → | Cloud Run + Nginx (spine-client) |
| Firestore DB | → | Firestore (不變，使用同一個 key) |

---

## 🚀 快速部署 (一鍵部署)

### 前置需求
1. 安裝 [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install)
2. 登入 GCP: `gcloud auth login`
3. 設定專案: `gcloud config set project spineanalysis1006test1`

### Windows 部署
```powershell
# 在專案根目錄執行
.\deploy.ps1

# 指定區域 (預設 asia-east1 台灣)
.\deploy.ps1 -Region asia-east1
```

### Linux / Mac 部署
```bash
chmod +x deploy.sh
./deploy.sh

# 指定區域
./deploy.sh asia-east1
```

---

## 🐳 本地 Docker 測試

### 使用 Docker Compose (推薦)
```bash
# 啟動前後端
docker compose up --build

# 前端: http://localhost:8080
# 後端: http://localhost:8083
# Swagger: http://localhost:8083/api/docs

# 背景執行
docker compose up --build -d

# 停止
docker compose down
```

### 個別建置
```bash
# 建置後端
docker build -t spine-server ./spine-server

# 建置前端 (需指定後端 URL)
docker build --build-arg REACT_APP_BASE_URL=http://localhost:8083/ -t spine-client ./spine-client

# 執行
docker run -p 8083:8083 spine-server
docker run -p 8080:8080 spine-client
```

---

## ☁️ GCP Cloud Build 自動部署 (CI/CD)

### 手動觸發 Cloud Build
```bash
gcloud builds submit --config cloudbuild.yaml
```

### 設定 Git 觸發器 (推送自動部署)
```bash
# 1. 連接 GitHub 儲存庫
gcloud builds triggers create github \
  --repo-name=2025-spine-analysis \
  --repo-owner=<你的GitHub帳號> \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --name=spine-auto-deploy
```

---

## 📁 新增檔案清單

```
2025-spine-analysis/
├── docker-compose.yml          # 本地 Docker Compose 配置
├── cloudbuild.yaml             # GCP Cloud Build CI/CD 配置
├── deploy.ps1                  # Windows 一鍵部署腳本
├── deploy.sh                   # Linux/Mac 一鍵部署腳本
├── spine-server/
│   ├── Dockerfile              # 後端 Docker 配置
│   └── .dockerignore           # Docker 建置排除
└── spine-client/
    ├── Dockerfile              # 前端 Docker 配置 (Multi-stage)
    ├── nginx.conf              # Nginx SPA 路由配置
    └── .dockerignore           # Docker 建置排除
```

---

## ⚙️ 重要說明

### Firestore 連接
- 後端 Docker Image 中已包含 `firestroekey.json`
- 使用原有的 Service Account 連接 Firestore
- **無需修改** 任何 Firestore 相關程式碼

### 環境變數
| 變數 | 後端 | 前端 |
|---|---|---|
| `PORT` | 8083 | 8080 |
| `NODE_ENV` | production | - |
| `REACT_APP_BASE_URL` | - | 自動偵測後端 URL |

### 成本估算
- Cloud Run 採用**按用量計費**，閒置時不收費
- 最小實例設為 0，無流量時自動縮減至 0
- 適合中小型應用，每月免費額度：
  - 200 萬次請求
  - 360,000 GB-秒 記憶體
  - 180,000 vCPU-秒 運算

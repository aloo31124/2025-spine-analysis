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
3. 設定專案: `gcloud config set project spineanalysis`

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
docker build -t spine-server ./backend

# 建置前端 (需指定後端 URL)
docker build --build-arg REACT_APP_BASE_URL=http://localhost:8083/ -t spine-client ./frontend

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

說明：`cloudbuild.yaml` 已預設 `_GCP_PROJECT_ID: spineanalysis`，部署目標會固定到 `spineanalysis` 專案。

注意：Project ID 與 Docker Image 名稱都必須是小寫，請使用實際的小寫 project id（例如 `spineanalysis`）。

若要臨時覆寫專案，可使用：
```bash
gcloud builds submit --config cloudbuild.yaml --substitutions=_GCP_PROJECT_ID=你的專案ID
```

### 常見錯誤排查（Cloud Build 權限）

若遇到以下錯誤：
- `API [cloudbuild.googleapis.com] not enabled`
- `storage.objects.get denied on gs://<project-id>_cloudbuild/...`

可依序執行以下指令（PowerShell）：

```powershell
# 專案 ID: spineanalysis  |  專案編號: 337270716934

# 1) 啟用必要 API
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com --project spineanalysis

# 2) 給 Compute 服務帳號專案建置權限
gcloud projects add-iam-policy-binding spineanalysis --member="serviceAccount:337270716934-compute@developer.gserviceaccount.com" --role="roles/cloudbuild.builds.builder"

# 2-1) 修復 Cloud Run 部署權限（對應 run.services.get denied）
gcloud projects add-iam-policy-binding spineanalysis --member="serviceAccount:337270716934-compute@developer.gserviceaccount.com" --role="roles/run.admin"

# 2-2) 允許部署時指定執行用 Service Account（預設 Compute SA）
gcloud iam service-accounts add-iam-policy-binding 337270716934-compute@developer.gserviceaccount.com --project=spineanalysis --member="serviceAccount:337270716934-compute@developer.gserviceaccount.com" --role="roles/iam.serviceAccountUser"

# 3) 給 Cloud Build 暫存 bucket 讀取權限（修復 storage.objects.get 403）
gcloud storage buckets add-iam-policy-binding gs://spineanalysis_cloudbuild --member="serviceAccount:337270716934-compute@developer.gserviceaccount.com" --role="roles/storage.objectViewer"

# 4) Cloud Build service agent 同樣補上讀取權限
gcloud storage buckets add-iam-policy-binding gs://spineanalysis_cloudbuild --member="serviceAccount:service-337270716934@gcp-sa-cloudbuild.iam.gserviceaccount.com" --role="roles/storage.objectViewer"

# 5) 重新送出建置
gcloud builds submit --project=spineanalysis --config cloudbuild.yaml
```

如果第 3 步出現 bucket 不存在，先執行一次 `gcloud builds submit` 讓系統自動建立 bucket，再回來補權限後重跑。

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
├── backend/
│   ├── Dockerfile              # 後端 Docker 配置
│   └── .dockerignore           # Docker 建置排除
└── frontend/
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

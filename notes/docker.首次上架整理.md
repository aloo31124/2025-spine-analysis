2026.04.08



[build] # [docker]首次自動化部屬至[GCP]。
[why] 自動化，團隊需求。
[how]
📊 GCP 環境對應評估
原始 Firebase 環境	GCP 對應環境	原因
- Firebase Cloud Functions (後端)	Cloud Run	容器化 Express 應用，自動擴縮，按用量計費
- Firebase Hosting (前端)	Cloud Run + Nginx	容器化靜態網站，SPA 路由支援
- Firestore	不變	使用原有 firestroekey.json Service Account

新增檔案 (共 9 個)
根目錄/
├── docker-compose.yml          # 本地 Docker Compose 一鍵啟動
├── cloudbuild.yaml             # GCP Cloud Build CI/CD 自動部署
├── deploy.ps1                  # Windows 一鍵部署腳本
├── deploy.sh                   # Linux/Mac 一鍵部署腳本
├── cloud-builders/
│   └── DOCKER-GCP-DEPLOY.md   # 完整部署文件
├── spine-server/
│   ├── Dockerfile              # 後端: Node.js 20 Alpine
│   └── .dockerignore
└── spine-client/
    ├── Dockerfile              # 前端: Multi-stage (React Build + Nginx)
    ├── nginx.conf              # SPA 路由設定
    └── .dockerignore

1️⃣ 本地測試 (Docker Compose)
2️⃣ 一鍵部署至 GCP (根目錄執行)
- .\deploy.ps1  # Windows
- ./deploy.sh   # Linux/Mac
3️⃣ CI/CD 自動部署 (Cloud Build)
- gcloud builds submit --config cloudbuild.yaml

[fix] 卡在 Creating temporary archive of 62682 file(s) totalling 1000.9 MiB before compression.
問題原因：沒有 .gcloudignore，gcloud 把整個專案 62682 個檔案 (含 node_modules) 全部上傳，共 1GB+。
修復方式： 已建立 .gcloudignore，排除 node_modules、build、notes 等不必要檔案。

[fix] BUILD FAILURE: Build step failure: build step 0 "gcr.io/cloud-builders/docker" failed: step exited with non-zero status: 125
失敗原因
- $COMMIT_SHA 只有在 Cloud Build 由 Git 觸發器觸發時才有值。
- 手動執行 gcloud builds submit 時，$COMMIT_SHA 為空，
- 導致 Docker tag 變成 gcr.io/project/spine-server:（無效的 tag），Docker 直接報錯 exit 125。
已修正
- 移除所有 $COMMIT_SHA 引用，改為只使用 :latest tag。

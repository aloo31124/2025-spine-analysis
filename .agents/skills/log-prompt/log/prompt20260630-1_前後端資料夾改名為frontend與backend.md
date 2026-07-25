2026-06-30 06:11:01

## git commit
[reactor] #4 [專案結構] 將前後端資料夾 spine-client/spine-server 改名為 frontend/backend。
- 以 `git mv` 將 `spine-client`→`frontend`、`spine-server`→`backend`，保留 git 歷史與 `node_modules`。
- 更新資料夾路徑參照：`cloudbuild.yaml`、`deploy.sh`、`deploy.ps1`、`docker-compose.yml`(build context)、`.gcloudignore`、`.vscode/launch.json`。
- 同步更新文件與後端 migration 註解中的路徑：`cloud-builders/DOCKER-GCP-DEPLOY.md`、`backend/src/migrations/add-phase2-fields.js`。
- 同步更新 SKILL.md：`.github/skills/permission-role/SKILL.md`、`.github/skills/customer-model-recommendation/SKILL.md` 內的檔案路徑。
- 刻意保留 Cloud Run 服務名 `spine-server`/`spine-client`、docker-compose 服務/容器名、image tag —— 屬部署識別碼而非資料夾，改名會影響正式環境。
- 原因：統一前後端資料夾命名為 frontend/backend，提升專案結構可讀性。

## prompt 1
將前後端資料夾改為 frontend 與 backend

## prompt 1 response
- 盤點專案頂層資料夾，判定 `spine-client`=前端（React/cypress/nginx）、`spine-server`=後端（Node/express/firebase-admin）；`spine-app`（手機 App）非前後端，維持不動。
- 以 `git mv` 完成改名：`spine-client`→`frontend`、`spine-server`→`backend`，`node_modules` 一併移動、git 視為 rename 保留歷史。
- 更新「資料夾路徑」參照（共 8 處檔案）：`cloudbuild.yaml`(build context)、`deploy.sh`、`deploy.ps1`、`docker-compose.yml`(context)、`.gcloudignore`、`.vscode/launch.json`、`cloud-builders/DOCKER-GCP-DEPLOY.md`、`backend/src/migrations/add-phase2-fields.js` 註解。
- 同步更新兩份 `.github/skills/*/SKILL.md` 內的程式碼檔案路徑（`spine-client/`→`frontend/`、`spine-server/`→`backend/`）。
- 關鍵決策：刻意「保留」Cloud Run 服務名（`_SERVER_SERVICE: spine-server`/`_CLIENT_SERVICE: spine-client`）、docker-compose 服務/容器名、Docker image tag —— 這些是部署/執行期識別碼而非資料夾，改名會在 GCP 建立新服務並變更正式環境網址；歷史 `notes/` 與 skill log 屬時間點紀錄亦不改寫。
- 驗證 git 狀態：磁碟無殘留舊資料夾、0 筆未配對刪除（皆為乾淨 rename）；`frontend/package.json`=newshop-client(react-scripts)、`backend/package.json`=newshop-server(express/firebase-admin)，各自身分正確。

## prompt 2
/log-prompt 並啟動驗證功能正常

## prompt 2 response
- 啟動驗證（後端）：以 `node backend/src/index.js` 從新路徑啟動，開機 log 印出「[頸椎分析系統]伺服器啟動 http://0.0.0.0:8083」，`curl http://localhost:8083/api/docs/` 回 HTTP 200，確認後端可從 `backend/` 正常運行；驗證後以 port 8083 停止程序、釋放埠口。
- 啟動驗證（前端）：於 `frontend/` 執行 `react-scripts build`，編譯成功產出 gzip bundle（main.js 250.88 kB、main.css 21.13 kB），僅有既有 ESLint warning、無錯誤，「build folder is ready to be deployed」，確認前端可從 `frontend/` 正常建置。
- 結論：資料夾改名未破壞前後端啟動與建置；路徑參照（launch.json / cloudbuild / docker-compose context）皆指向有效路徑。
- 依 log-prompt 規範產出本紀錄：Glob 查無今日紀錄，流水號取 1，檔名 `prompt20260630-1_前後端資料夾改名為frontend與backend.md`。

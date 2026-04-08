<# 
  ====================================
  頸椎分析系統 - GCP 自動部署腳本 (Windows)
  ====================================
  使用方式: .\deploy.ps1
  前置需求: 安裝 gcloud CLI 並已登入
#>

param(
    [string]$Region = "asia-east1",
    [string]$ServerService = "spine-server",
    [string]$ClientService = "spine-client"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  頸椎分析系統 - GCP Cloud Run 自動部署" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 取得 GCP 專案 ID
$ProjectId = gcloud config get-value project 2>$null
if (-not $ProjectId) {
    Write-Host "[錯誤] 請先設定 GCP 專案: gcloud config set project <PROJECT_ID>" -ForegroundColor Red
    exit 1
}
Write-Host "[資訊] GCP 專案: $ProjectId" -ForegroundColor Green
Write-Host "[資訊] 部署區域: $Region" -ForegroundColor Green
Write-Host ""

# 啟用必要的 GCP API
Write-Host "[1/7] 啟用 GCP API 服務..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com --quiet

# 建置後端 Docker Image
Write-Host "[2/7] 建置後端 Docker Image..." -ForegroundColor Yellow
gcloud builds submit ./spine-server `
    --tag "gcr.io/$ProjectId/$ServerService`:latest" `
    --quiet

# 部署後端至 Cloud Run
Write-Host "[3/7] 部署後端至 Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServerService `
    --image "gcr.io/$ProjectId/$ServerService`:latest" `
    --region $Region `
    --platform managed `
    --port 8083 `
    --memory 512Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 10 `
    --allow-unauthenticated `
    --set-env-vars "NODE_ENV=production" `
    --quiet

# 取得後端 URL
Write-Host "[4/7] 取得後端服務 URL..." -ForegroundColor Yellow
$ServerUrl = gcloud run services describe $ServerService --region $Region --format "value(status.url)"
Write-Host "[資訊] 後端 URL: $ServerUrl" -ForegroundColor Green

# 建置前端 Docker Image (帶入後端 URL)
Write-Host "[5/7] 建置前端 Docker Image..." -ForegroundColor Yellow
$BuildArg = "REACT_APP_BASE_URL=$ServerUrl/"

# 建立暫存 cloudbuild 設定用於前端建置 (支援 build-arg)
$TempBuildConfig = @"
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - '$BuildArg'
      - '-t'
      - 'gcr.io/$ProjectId/${ClientService}:latest'
      - '.'
images:
  - 'gcr.io/$ProjectId/${ClientService}:latest'
"@

$TempFile = "spine-client\_cloudbuild_temp.yaml"
$TempBuildConfig | Out-File -FilePath $TempFile -Encoding utf8
gcloud builds submit ./spine-client --config $TempFile --quiet
Remove-Item $TempFile -ErrorAction SilentlyContinue

# 部署前端至 Cloud Run
Write-Host "[6/7] 部署前端至 Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ClientService `
    --image "gcr.io/$ProjectId/$ClientService`:latest" `
    --region $Region `
    --platform managed `
    --port 8080 `
    --memory 256Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 5 `
    --allow-unauthenticated `
    --quiet

# 取得前端 URL
$ClientUrl = gcloud run services describe $ClientService --region $Region --format "value(status.url)"

# 完成
Write-Host "" 
Write-Host "============================================" -ForegroundColor Green
Write-Host "  [7/7] 部署完成！" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  前端網址: $ClientUrl" -ForegroundColor Cyan
Write-Host "  後端 API: $ServerUrl" -ForegroundColor Cyan
Write-Host "  Swagger:  $ServerUrl/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Firestore 連接: 使用原有 firestroekey.json (已包含於 Image)" -ForegroundColor Gray
Write-Host ""

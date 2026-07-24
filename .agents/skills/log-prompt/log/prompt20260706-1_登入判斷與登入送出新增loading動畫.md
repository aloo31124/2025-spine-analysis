2026-07-06 00:00:00

## git commit
[feature] #4 [登入驗證] 網頁進入登入判斷與登入送出流程新增畫面 loading 動畫。
- 新增 `frontend/src/components/Loading.module.css`，以 CSS Modules 撰寫全螢幕遮罩 + 圈圈旋轉動畫樣式。
- 改寫 `frontend/src/components/Loading.jsx`，由純文字「loading...」升級為可重用的 Overlay Spinner 元件，支援 `text` prop 自訂文案。
- `AppRouterVerify.jsx` 原本進入頁面判斷 JWT/角色/方案時已使用 `<Loading />`，元件升級後自動套用新動畫，無需改動邏輯。
- `pages/auth/LoginPage.jsx` 的 `clickLogin` 新增 `isLoading` state，以 `try/finally` 包住 `login()` 呼叫，送出帳密期間顯示 `<Loading text='登入中...' />` 遮罩並停用登入按鈕，避免重複送出。
- 原因：使用者反映登入判斷與登入送出過程中畫面無任何回饋，容易誤以為卡住或重複點擊。

## prompt 1
網頁剛進入判斷是否登入，與輸入帳號密碼後，增加畫面 loading 動畫

## prompt 1 response
- 派 Explore agent 研究現有登入判斷（`AppRouterVerify.jsx` useEffect 驗證 JWT/角色/方案）、登入頁 `LoginPage.jsx` 的 `clickLogin`、既有 Loading 元件與 CSS 慣例（CSS Modules 為主）
- 發現全站沒有統一可重用的 Loading/Spinner 元件，僅 `components/Loading.jsx` 為純文字「loading...」
- 新增 `Loading.module.css`，將 `Loading.jsx` 升級為全螢幕遮罩（`position: fixed; inset:0`）+ 圈圈旋轉動畫的 Overlay Spinner，並支援自訂 `text` prop
- `AppRouterVerify.jsx` 原本已在驗證中 render `<Loading />`，元件升級後自動套用新動畫，未改動任何邏輯
- `LoginPage.jsx` 新增 `isLoading` state，`clickLogin` 以 `try/finally` 包住 `login()` API 呼叫，登入中顯示 `<Loading text='登入中...' />` 遮罩並停用登入按鈕防止重複送出
- 以 `npx eslint` 檢查兩份修改檔案，僅既有無關的 `togglePasswordVisibility` unused-vars 警告，無新增錯誤

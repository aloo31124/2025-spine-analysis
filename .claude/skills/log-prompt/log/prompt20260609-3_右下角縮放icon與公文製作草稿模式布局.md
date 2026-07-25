2026-06-09 15:40:52

## git commit
[style] #755 [公文製作] styleExamples 右下角縮放 icon 與公文製作草稿模式布局
- 新增 Frontend/src/styleExamples/右下角比例縮放icon.html：50%~200% 步進/滑桿/預設 chip + 頁寬，fixed 右下角、可收合，收合小 icon 顯示目前比例；配色圓角對齊 DraftList。
- 新增 Frontend/src/styleExamples/公文製作布局_草稿模式.html：整合上方選單、左下角文稿清單、右下角縮放、formatExamples 函/簽，三頁分頁（簽/函/函續頁）分頁間 1.2cm 間隔，縮放以 CSS zoom 套用、頁寬自動符合、點 chip 捲動至對應頁。
- ZoomControl 收合小 icon 顯示比例同步套用於兩檔（右下角比例縮放icon.html、公文製作布局_草稿模式.html）。
- 公文製作布局新增下方操作列「新增草稿」(主色實心) /「取號上傳」(白底外框)，並新增 @media(max-width:640px) 手機版 RWD：工具列縮小可橫向捲動、操作列改全寬底部兩鈕平分、文稿清單/縮放上移避免重疊、手機載入預設頁寬。

## prompt 1
Frontend\src\styleExamples\右下角比例縮放icon.html
請產生 50% ~ 200% 與 頁寬 的樣式，
在右下角可讓使用者選擇縮方比例，
請 fiexed 在右下角，並操作友善，
相關樣式與 UIUX 可參考
Frontend\src\styleExamples\左下角文稿清單.html

## prompt 1 response
- 建立 右下角比例縮放icon.html（原檔空白）：ZoomControl 縮放控制純樣式參考。
- 配色／圓角對齊 左下角文稿清單.html(DraftList)：主色 #4f85a3、白邊框、容器 24px、chip 14px、一致 box-shadow。
- fixed 右下角；操作友善：[−]/[+] 步進(±10%、邊界 disabled)、中央百分比點擊展開上方選單(預設比例 chip + 拖曳滑桿 + 頁寬)、右側 chevron 左右收合。
- 加入 aria 屬性、點選單外與 Esc 關閉、prefers-reduced-motion。

## prompt 2
產生 公文製作布局 layout，
並產生於 Frontend\src\styleExamples\公文製作布局_草稿模式.html
引用 
Frontend\src\styleExamples\上方選單.html
Frontend\src\styleExamples\左下角文稿清單.html
Frontend\src\styleExamples\右下角比例縮放icon.html
還有引用
Frontend\src\formatExamples
Frontend\src\formatExamples\函.html
Frontend\src\formatExamples\簽.html
產生多至少三頁分頁，
且分頁之間至少 1cm 的間隔。

## prompt 2 response
- 建立 公文製作布局_草稿模式.html（原檔空白）：整合草稿模式編輯畫面。
- 引用上方選單.html（頂部工具列＋螢光筆/標點符號浮動 bar）、左下角文稿清單.html（DraftList 改 簽/函/函續頁，點 chip 平滑捲動至對應頁）、右下角比例縮放icon.html（ZoomControl 接線，CSS zoom 套用 50%~200%，頁寬自動符合並隨 resize 重算）。
- 引用 formatExamples 簽.html、函.html：合併格式 CSS 產出三頁（簽/函/函續頁），頁尾標示共 3 頁。
- 分頁採 flex gap 1.2cm（≥1cm）間隔，每頁右上角加文稿類型徽章。

## prompt 3
Frontend\src\styleExamples\右下角比例縮放icon.html
縮放icon 收合成小icon後，請顯示 %比例。

## prompt 3 response
- 右下角比例縮放icon.html：收合後的小 icon 由純 chevron 改為顯示目前比例（100% / 頁寬）。
- 切換鈕內新增 .zoom-collapse-num（收合才顯示）；收合時按鈕由圓形改藥丸狀容納字樣，保留旋轉 chevron 作展開提示。
- apply() 計算 label 後同步寫入展開 valueNum 與收合 collapseNum，步進/滑桿/預設/頁寬操作後收合比例即時更新。

## prompt 4
Frontend\src\styleExamples\公文製作布局_草稿模式.html
一併修改 右下角 縮放icon 一致。

## prompt 4 response
- 公文製作布局_草稿模式.html 內的縮放控制副本對齊標準檔：收合小 icon 顯示比例（100% / 頁寬）。
- CSS 新增 .zoom-collapse-num 與藥丸狀收合鈕規格（width auto / min-width 28px / padding 0 10px / radius 14px），對齊 右下角比例縮放icon.html。
- HTML 切換鈕加入 zoomCollapseNum span；JS 新增 collapseNum 參照，apply() 以 label 同步寫入展開與收合顯示。

## prompt 5
下方增加兩按鈕，"新增草稿" 與 "取號上傳"
並且優化 手機版時之 RWD 調整。

## prompt 5 response
- 公文製作布局_草稿模式.html 新增 .doc-action-bar 下方操作列：「新增草稿」(主色實心)、「取號上傳」(白底外框)，配 bi-file-earmark-plus / bi-cloud-upload，桌機置於畫面下方正中。
- 兩鈕加上純參考用 click 示意 handler（alert）。
- 新增 @media(max-width:640px) RWD：工具列縮小並可橫向捲動；操作列改全寬底部、兩鈕 flex 平分；文稿清單/縮放上移 bottom:64px 避免重疊；畫布 padding-bottom 加大；浮動 bar 上移 top:54px。
- 手機版載入預設切「頁寬」模式，避免 A4 橫向溢出。

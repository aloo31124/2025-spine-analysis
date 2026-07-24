2026-06-09 12:00:00

## git commit
[style] #755 [公文製作] DraftList 左下角[文稿清單] 左右收合動畫、樣式抽離參考檔與函樣式調整。
- DraftList 收合 icon 由上下改為左右方向（向左收合 / 向右展開）
- DraftList 左右收合加入絲滑過渡：chevron CSS rotate 翻轉、chip 清單 max-width+opacity+translateX 水平展開、容器 padding/border-radius 平滑伸縮，並加 prefers-reduced-motion。
- 新增 styleExamples/左下角文稿清單.html：將 DraftList scoped 樣式完整抽離為自包含 HTML，含展開/收合兩狀態互動，供設計師參考。
- 依 formatExamples/函.html 調整函樣式：margin-top/bottom 1cm→0.9cm、section-gap 0.3cm→0.25cm、署長簽名 margin-top 0.5cm→0cm、受文者區移除「受文地址」列。

## prompt 1
Frontend\src\components\DraftList.vue
優化該元件，上下收合 icon 改成左右收合

## prompt 1 response
- 將 DraftList.vue 收合/展開的兩個 SVG 箭頭由上下改為左右方向
- 展開狀態收合鈕：向下箭頭 `M3 6l5 5 5-5` 改為向左 `M10 3l-5 5 5 5`
- 收合狀態展開鈕：向上箭頭 `M3 10l5-5 5 5` 改為向右 `M6 3l5 5-5 5`
- 同步更新元件頂部說明註解與 icon 旁註解的方向描述
- 互動邏輯（isCollapsed、aria-label、title）維持不變，僅調整視覺方向

## prompt 2
Frontend\src\components\DraftList.vue
左右收合請加入一些絲滑簡易的動畫效果

## prompt 2 response
- chevron 改用單一向左 icon，收合時加 is-flipped 以 CSS rotate(180deg)+cubic-bezier 做順暢翻轉
- chip 清單包進 `<Transition name="draft-collapse">`，以 max-width(60vw↔0)＋opacity＋translateX(-8px) 做水平展開/收合
- 收合時「創稿 N」標籤改用 draft-fade 淡入淡出
- 膠囊容器 padding／border-radius 加 transition 平滑伸縮
- 加入 @media (prefers-reduced-motion: reduce) 關閉所有過渡，尊重無障礙偏好
- 切換鈕改為常駐單一按鈕，isCollapsed 取反，aria-label/title 依狀態動態切換
- （備註：此動畫版本後續被使用者還原，最終 DraftList 維持左右 icon 但不含動畫）

## prompt 3
樣式 完整抽離至
Frontend\src\styleExamples\左下角文稿清單.html
方便設計師樣式參考。

## prompt 3 response
- 先參考既有 styleExamples（上方選單.html、新增文稿.html）的慣例：自包含 HTML，含 Reset＋元件 CSS＋靜態 markup＋vanilla JS 互動
- 新建 styleExamples/左下角文稿清單.html，將 DraftList.vue 全部 class 樣式（draft-list-fixed/toggle/scroll/chip/is-active/is-collapsed 及 CSS 變數、捲軸樣式）完整抽離
- 以 `<template>` 提供展開（向左 chevron＋5 個 chip）與收合（向右 chevron＋創稿 5）兩種狀態，可點擊切換並切換 chip 高亮
- 加入非元件的 .demo-canvas 示意編輯區背景，凸顯左下角浮動效果
- Vue 元件本身未改動；styleExamples 為獨立參考檔

## prompt 4
參考
Frontend\src\formatExamples\函.html
調整 函的樣式

## prompt 4 response
- 以 git diff 比對 formatExamples/函.html 本次改動，濾掉純示範文字（主旨/說明長度、body padding）後鎖定四項樣式規範差異
- 將四項同步至 DocumentBody.vue：--margin-top/--margin-bottom 1cm→0.9cm、--section-gap 0.3cm→0.25cm、.signature-section margin-top 0.5cm→0cm、recipient-section 移除「受文地址」列
- 提醒使用者：前三項為 .a4-doc-page 頁面層級 CSS 變數，由函/簽等格式共用，調整會一併套用其他格式；移除受文地址僅影響函類

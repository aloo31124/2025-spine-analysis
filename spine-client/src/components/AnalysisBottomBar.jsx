import React from 'react';

/**
 * 分析頁面底部操控列
 * 包含縮放按鈕、計算/儲存切換、拍照、空白畫面切換
 */
function AnalysisBottomBar({
    isCalculated, onCalculate, onSave,
    onPhoto, onToggleBlank, showBlankScreen,
    currentScale, minScale, maxScale,
    onZoomIn, onZoomOut
}) {
    return (
        <>
            {/* 縮放控制按鈕 */}
            <div className="menu-bottom-second">
                <button onClick={onZoomIn} disabled={currentScale >= maxScale}>+</button>
                <button onClick={onZoomOut} disabled={currentScale <= minScale}>-</button>
            </div>

            <div className="menu-bottom">
                {!isCalculated ? (
                    <button onClick={onCalculate} className="action-btn">
                        計算
                    </button>
                ) : (
                    <button onClick={onSave} className="action-btn">
                        儲存結果
                    </button>
                )}
                <span>&nbsp;&nbsp;&nbsp;</span>
                <button onClick={onPhoto} className="action-btn">
                    拍攝新照片
                </button>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <button onClick={onToggleBlank} className="action-btn">
                    {showBlankScreen ? '還原圖片' : '切換空白畫面'}
                </button>
            </div>
        </>
    );
}

export default AnalysisBottomBar;

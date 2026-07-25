import React from 'react';
import './ScaleIndicator.css';
import { SCALE_REFERENCE } from '../utils/scaleConversion';
import { convertScreenPxToCm } from '../utils/screenConversion';

const SEGMENT_COUNT = 5;
const SEGMENT_CM = SCALE_REFERENCE.cmPerSegment;
const PIXELS_PER_SEGMENT = SCALE_REFERENCE.pxPerSegment;

/**
 * 比例尺顯示組件
 * @param {string} className - 額外的 CSS 類名
 * @param {number} scaleFactor - 比例尺縮放因子（預設為 1.0）
 * @param {function} onScaleFactorChange - 縮放因子改變時的回調函數
 * @param {boolean} useScreenDPI - 是否使用螢幕實際 DPI 計算（空白畫面模式）
 */
function ScaleIndicator({ className = '', scaleFactor = 1.0, onScaleFactorChange, useScreenDPI = false }) {
    const segments = Array.from({ length: SEGMENT_COUNT });
    
    // 根據模式選擇計算方式
    let adjustedCmPerSegment;
    let labels;
    
    if (useScreenDPI) {
        // 空白畫面模式：使用螢幕實際 DPI 計算
        adjustedCmPerSegment = convertScreenPxToCm(PIXELS_PER_SEGMENT);
        labels = Array.from({ length: SEGMENT_COUNT + 1 }, (_, index) => 
            `${(index * adjustedCmPerSegment).toFixed(1)}cm`
        );
    } else {
        // 正常模式：根據縮放因子計算顯示的公分數值
        adjustedCmPerSegment = SEGMENT_CM * scaleFactor;
        labels = Array.from({ length: SEGMENT_COUNT + 1 }, (_, index) => 
            `${(index * adjustedCmPerSegment).toFixed(1)}cm`
        );
    }

    // 處理放大按鈕點擊 - 數值放大 10%
    const handleZoomIn = () => {
        if (onScaleFactorChange) {
            const newScaleFactor = scaleFactor * 1.1;
            onScaleFactorChange(newScaleFactor);
        }
    };

    // 處理縮小按鈕點擊 - 數值縮小 10%
    const handleZoomOut = () => {
        if (onScaleFactorChange) {
            const newScaleFactor = scaleFactor * 0.9;
            onScaleFactorChange(newScaleFactor);
        }
    };

    return (
        <div
            className={`scale-indicator ${className}`.trim()}
            role="presentation"
            aria-label={`比例尺顯示，每 ${PIXELS_PER_SEGMENT} 像素等於 ${adjustedCmPerSegment.toFixed(1)} 公分`}
        >
            {/* 放大按鈕 - 空白畫面模式下不顯示 */}
            {onScaleFactorChange && !useScreenDPI && (
                <button 
                    className="scale-indicator__zoom-btn scale-indicator__zoom-btn--top"
                    onClick={handleZoomIn}
                    aria-label="放大比例尺數值"
                    title="放大比例尺數值 10%"
                >
                    +
                </button>
            )}
            
            <div className="scale-indicator__title">比例尺</div>
            <div className="scale-indicator__content" aria-hidden="true">
                <div className="scale-indicator__bar">
                    {segments.map((_, index) => (
                        <span
                            key={`scale-segment-${index}`}
                            className={`scale-indicator__segment ${
                                index % 2 === 0
                                    ? 'scale-indicator__segment--light'
                                    : 'scale-indicator__segment--dark'
                            }`}
                        />
                    ))}
                </div>
                <div className="scale-indicator__labels">
                    {labels.map((label, index) => (
                        <span key={`scale-label-${label}-${index}`}>{label}</span>
                    ))}
                </div>
            </div>
            <div className="scale-indicator__note">
                {useScreenDPI 
                    ? `${PIXELS_PER_SEGMENT}px = ${adjustedCmPerSegment.toFixed(2)}cm (螢幕實際尺寸)` 
                    : `${PIXELS_PER_SEGMENT}px = ${adjustedCmPerSegment.toFixed(1)}cm`
                }
            </div>
            
            {/* 縮小按鈕 - 空白畫面模式下不顯示 */}
            {onScaleFactorChange && !useScreenDPI && (
                <button 
                    className="scale-indicator__zoom-btn scale-indicator__zoom-btn--bottom"
                    onClick={handleZoomOut}
                    aria-label="縮小比例尺數值"
                    title="縮小比例尺數值 10%"
                >
                    -
                </button>
            )}
        </div>
    );
}

export default ScaleIndicator;

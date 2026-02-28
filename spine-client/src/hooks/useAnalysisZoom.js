import { useState } from 'react';

/**
 * 畫面縮放 Hook
 * 透過 CSS transform 控制容器縮放
 *
 * @param {Object}         options
 * @param {React.RefObject} options.wrapperRef - 容器 wrapper DOM ref
 * @param {number}         [options.minScale=0.5]
 * @param {number}         [options.maxScale=2.0]
 * @param {number}         [options.scaleStep=0.1]
 */
export function useAnalysisZoom({ wrapperRef, minScale = 0.5, maxScale = 2.0, scaleStep = 0.1 }) {
    const [currentScale, setCurrentScale] = useState(1);

    const applyScale = (scale) => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.transformOrigin = 'center top';
        setCurrentScale(scale);
    };

    const handleZoomIn = () => applyScale(Math.min(currentScale + scaleStep, maxScale));
    const handleZoomOut = () => applyScale(Math.max(currentScale - scaleStep, minScale));

    return { currentScale, minScale, maxScale, handleZoomIn, handleZoomOut };
}

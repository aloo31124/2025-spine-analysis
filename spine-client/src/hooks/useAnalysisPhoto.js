import { useState, useEffect, useRef } from 'react';

/**
 * 照片 & 背景管理 Hook
 * 處理 localStorage / location.state 照片載入、空白畫面切換、容器背景樣式
 *
 * @param {Object}   options
 * @param {string}   options.defaultImage       - 預設背景圖片路徑
 * @param {string}   options.defaultBgPosition  - 預設背景圖位置（如 'center top'）
 * @param {Object}   options.locationState       - React Router location.state
 * @param {Function} options.onPointsReceived    - 收到傳入點位時的回呼 (relativePoints, imageSize) => void
 */
export function useAnalysisPhoto({ defaultImage, defaultBgPosition, locationState, onPointsReceived }) {
    const [backgroundImage, setBackgroundImage] = useState(defaultImage);
    const [showBlankScreen, setShowBlankScreen] = useState(false);

    // 用 ref 確保 callback 永遠取到最新版本（避免 setTimeout 閉包過期）
    const onPointsReceivedRef = useRef(onPointsReceived);
    useEffect(() => { onPointsReceivedRef.current = onPointsReceived; });

    // 從 localStorage 或 location.state 載入照片
    useEffect(() => {
        // 優先檢查 localStorage（來自 PhotoCapture）
        const storedPhoto = localStorage.getItem('spineAnalysisPhoto');
        const storedTimestamp = localStorage.getItem('spineAnalysisPhotoTimestamp');

        if (storedPhoto && storedTimestamp) {
            const timestamp = parseInt(storedTimestamp, 10);
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            if (now - timestamp < fiveMinutes) {
                setBackgroundImage(storedPhoto);
                localStorage.removeItem('spineAnalysisPhoto');
                localStorage.removeItem('spineAnalysisPhotoTimestamp');
                return;
            }
        }

        // 檢查 location.state（來自 PhotoCaptureDrag）
        const analysisData = locationState;
        if (analysisData && analysisData.photo && analysisData.points) {
            setBackgroundImage(analysisData.photo);
            if (Array.isArray(analysisData.points) && analysisData.points.length > 0) {
                setTimeout(() => {
                    onPointsReceivedRef.current?.(analysisData.points, analysisData.imageSize);
                }, 100);
            }
        }
    }, [locationState]);

    // 切換空白畫面
    const handleToggleBlankScreen = () => {
        if (!showBlankScreen) {
            alert('切換為空白畫面模式，距離計算將依照螢幕實際尺寸(公分)進行。請受測者身體緊貼於螢幕，確保測量準確。');
        }
        setShowBlankScreen(prev => !prev);
    };

    // 容器背景樣式
    const getContainerStyle = () => {
        if (showBlankScreen) {
            return { backgroundColor: 'white', backgroundImage: 'none' };
        }
        const style = { backgroundImage: `url(${backgroundImage})` };
        if (backgroundImage === defaultImage) {
            return { ...style, backgroundPosition: defaultBgPosition, backgroundSize: 'auto 135%' };
        }
        return { ...style, backgroundPosition: 'center', backgroundSize: 'cover' };
    };

    return {
        backgroundImage,
        showBlankScreen,
        handleToggleBlankScreen,
        getContainerStyle
    };
}

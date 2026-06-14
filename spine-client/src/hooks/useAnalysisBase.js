/**
 * useAnalysisBase — 頸椎/尾椎分析頁共用 Hook
 *
 * 抽取兩分析頁中完全相同的狀態管理、拖曳操作、縮放、拍照載入、
 * 儲存/客戶綁定流程、空白畫面切換等邏輯，避免大量重複程式碼。
 *
 * 各頁面只需實作自己的：
 *   - 點位初始化函式 (initPointsFn)
 *   - 點位拖曳約束函式 (applyConstraints)
 *   - 計算邏輯 (handleCalculate)
 *   - 比例尺變更回呼 (handleScaleFactorChange)
 *   - 儲存酬載建構函式 (buildSavePayload)
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import neckPatientImage from '../assets.spine/images/病患側面.png';
import { addCustomerAnalysisResult } from '../api/manager/customerAnalysisResult';
import { getCustomerList } from '../api/manager/customer';
import { initializePointsFromRelative } from '../utils/pointConstraints';

export { neckPatientImage };

/** 計算兩點之間的距離 */
export const calculateDistance = (pointA, pointB) => {
    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * @param {Object} config
 * @param {React.RefObject} config.containerRef  - 量測容器 ref
 * @param {React.RefObject} config.wrapperRef    - 外層 wrapper ref（用於縮放）
 * @param {string}   config.analysisType          - 'spine' | 'tail'
 * @param {string}   config.defaultBgPosition     - 預設患者圖片 backgroundPosition
 * @param {number}   config.minScale
 * @param {number}   config.maxScale
 * @param {number}   config.scaleStep
 * @param {Function} config.applyConstraints      - (points, idx, newX, newY, prev) => points[]
 * @param {Function} config.initPointsFn          - (containerW, containerH) => points[]
 * @param {Function} config.buildSavePayload      - (sharedState) => payload object
 */
export default function useAnalysisBase({
    containerRef,
    wrapperRef,
    analysisType,
    defaultBgPosition = 'center top',
    minScale = 0.5,
    maxScale = 2.0,
    scaleStep = 0.1,
    applyConstraints,
    initPointsFn,
    buildSavePayload,
}) {
    const navigate = useNavigate();
    const location = useLocation();

    // ─── 共用狀態 ──────────────────────────────────────────
    const [backgroundImage, setBackgroundImage] = useState(neckPatientImage);
    const [currentScale, setCurrentScale] = useState(1);
    const [points, setPoints] = useState([]);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [calculationResults, setCalculationResults] = useState([]);
    const [isCalculated, setIsCalculated] = useState(false);
    const [lines, setLines] = useState([]);
    const [intersectionPoints, setIntersectionPoints] = useState([]);
    const [showSaveOptions, setShowSaveOptions] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [showBlankScreen, setShowBlankScreen] = useState(false);
    const [scaleFactorState, setScaleFactorState] = useState(1.0);

    // ─── 重置計算狀態 ─────────────────────────────────────
    const resetState = () => {
        setCurrentPointIndex(0);
        setCalculationResults([]);
        setIsCalculated(false);
        setLines([]);
        setIntersectionPoints([]);
    };

    // ─── 初始化點位（僅 mount） ───────────────────────────
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        setPoints(initPointsFn(container.offsetWidth, container.offsetHeight));
        resetState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── 從 localStorage / location.state 載入照片 ────────
    useEffect(() => {
        const storedPhoto = localStorage.getItem('spineAnalysisPhoto');
        const storedTimestamp = localStorage.getItem('spineAnalysisPhotoTimestamp');

        if (storedPhoto && storedTimestamp) {
            const timestamp = parseInt(storedTimestamp, 10);
            const fiveMinutes = 5 * 60 * 1000;
            if (Date.now() - timestamp < fiveMinutes) {
                setBackgroundImage(storedPhoto);
                localStorage.removeItem('spineAnalysisPhoto');
                localStorage.removeItem('spineAnalysisPhotoTimestamp');
                return;
            }
        }

        const analysisData = location.state;
        if (analysisData?.photo && analysisData?.points) {
            setBackgroundImage(analysisData.photo);
            if (Array.isArray(analysisData.points) && analysisData.points.length > 0) {
                setTimeout(() => {
                    const container = containerRef.current;
                    if (!container) return;
                    const newPoints = initializePointsFromRelative(
                        analysisData.points,
                        analysisData.imageSize,
                        container.offsetWidth,
                        container.offsetHeight,
                    );
                    setPoints(newPoints);
                    resetState();
                }, 100);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    // ─── 拖曳：設定可拖曳點位 ─────────────────────────────
    const setDraggablePoint = useCallback((index) => {
        setPoints(prev => prev.map((p, i) => ({ ...p, isDraggable: i === index })));
        setCurrentPointIndex(index);
    }, []);

    // ─── 拖曳：開始 ───────────────────────────────────────
    const handleMouseDown = (e, pointIndex) => {
        e.preventDefault();
        if (points[pointIndex] && !points[pointIndex].isDraggable) {
            setDraggablePoint(pointIndex);
        }
        setIsDragging(true);

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = containerRef.current.getBoundingClientRect();

        setDragStart({
            x: clientX - rect.left - points[pointIndex].x,
            y: clientY - rect.top - points[pointIndex].y,
        });
    };

    // ─── 拖曳：移動 ───────────────────────────────────────
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();

        let newX = clientX - rect.left - dragStart.x;
        let newY = clientY - rect.top - dragStart.y;
        newX = Math.max(0, Math.min(container.offsetWidth - 10, newX));
        newY = Math.max(0, Math.min(container.offsetHeight - 10, newY));

        setPoints(prev => {
            const previousPoint = prev[currentPointIndex];
            return applyConstraints(prev, currentPointIndex, newX, newY, previousPoint);
        });
    };

    // ─── 拖曳：結束 ───────────────────────────────────────
    const handleMouseUp = () => setIsDragging(false);

    // ─── 拖曳：全域事件監聽 ───────────────────────────────
    useEffect(() => {
        if (!isDragging) return;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleMouseMove, { passive: false });
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDragging, dragStart, currentPointIndex]);

    // ─── 縮放 ─────────────────────────────────────────────
    const applyScale = (scale) => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.transformOrigin = 'center top';
        setCurrentScale(scale);
    };

    const handleZoomIn = () => applyScale(Math.min(currentScale + scaleStep, maxScale));
    const handleZoomOut = () => applyScale(Math.max(currentScale - scaleStep, minScale));

    // ─── 導航 ─────────────────────────────────────────────
    const handleGoToPhotoCapture = () => navigate('/manager/photo/capture');

    // ─── 儲存流程 ─────────────────────────────────────────
    const handleSaveResult = () => setShowSaveOptions(true);

    const handleCloseModals = () => {
        setShowSaveOptions(false);
        setShowCustomerModal(false);
    };

    const getSharedState = () => ({
        points, lines, intersectionPoints, calculationResults,
        backgroundImage, currentScale, scaleFactorState,
    });

    const handleBindCustomer = async () => {
        try {
            const response = await getCustomerList({}, { pageIndex: 1, pageSize: 1000, sort: 'createdAt' });
            if (response.status === 200) {
                setCustomerList(response.data.result.customerList || []);
                setShowSaveOptions(false);
                setShowCustomerModal(true);
            }
        } catch (error) {
            console.error('取得客戶列表錯誤:', error);
            alert('取得客戶列表失敗');
        }
    };

    const handleCreateNewCustomer = () => {
        try {
            const userId = localStorage.getItem('userId') || 'default_user';
            const payload = {
                ...buildSavePayload(getSharedState()),
                userId,
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem('pendingAnalysisData', JSON.stringify(payload));
            setShowSaveOptions(false);
            navigate('/manager/customer/add');
        } catch (error) {
            console.error('處理新建客戶錯誤:', error);
            alert('處理新建客戶失敗');
        }
    };

    const saveAnalysisResult = async (customerId) => {
        try {
            const userId = localStorage.getItem('userId') || 'default_user';
            const payload = {
                customerId,
                userId,
                ...buildSavePayload(getSharedState()),
            };
            const response = await addCustomerAnalysisResult(payload);
            if (response.status === 200) return response.data;
        } catch (error) {
            console.error('保存分析結果錯誤:', error);
            throw error;
        }
    };

    const handleSelectCustomer = async (customer) => {
        try {
            await saveAnalysisResult(customer.id);
            setShowCustomerModal(false);
            navigate('/manager/customer/edit/' + customer.id, { state: { customer, fromSpineAnalysis: analysisType === 'spine' } });
        } catch (error) {
            console.error('保存分析結果錯誤:', error);
            alert('保存分析結果失敗');
        }
    };

    // ─── 容器背景樣式 ─────────────────────────────────────
    const getContainerStyle = () => {
        if (showBlankScreen) {
            return { backgroundColor: 'white', backgroundImage: 'none' };
        }
        const style = { backgroundImage: `url(${backgroundImage})` };
        if (backgroundImage === neckPatientImage) {
            return { ...style, backgroundPosition: defaultBgPosition, backgroundSize: 'auto 135%' };
        }
        return { ...style, backgroundPosition: 'center', backgroundSize: 'cover' };
    };

    // ─── 空白畫面切換 ─────────────────────────────────────
    const handleToggleBlankScreen = () => {
        if (!showBlankScreen) {
            alert('切換為空白畫面模式，距離計算將依照螢幕實際尺寸(公分)進行。請受測者身體緊貼於螢幕，確保測量準確。');
        }
        setShowBlankScreen(!showBlankScreen);
    };

    // ─── 回傳 ─────────────────────────────────────────────
    return {
        // State
        backgroundImage,
        currentScale,
        points, setPoints,
        currentPointIndex,
        calculationResults, setCalculationResults,
        isCalculated, setIsCalculated,
        lines, setLines,
        intersectionPoints, setIntersectionPoints,
        showSaveOptions,
        showCustomerModal,
        customerList,
        showBlankScreen,
        scaleFactorState, setScaleFactorState,

        // Handlers
        setDraggablePoint,
        handleMouseDown,
        handleZoomIn,
        handleZoomOut,
        handleGoToPhotoCapture,
        handleSaveResult,
        handleBindCustomer,
        handleCreateNewCustomer,
        handleSelectCustomer,
        handleCloseModals,
        handleToggleBlankScreen,
        getContainerStyle,

        // Scale limits (for UI disabled state)
        minScale,
        maxScale,
    };
}

import React, { useRef } from 'react';
import './AnalysisSpine.css';
import ScaleIndicator from '../../components/ScaleIndicator';
import { convertPxToCm, formatPxCmText } from '../../utils/scaleConversion';
import { formatDistanceWithMode } from '../../utils/screenConversion';
import { applyTailPointConstraints } from '../../utils/pointConstraints';
import useAnalysisBase, { calculateDistance, neckPatientImage } from '../../hooks/useAnalysisBase';

// ─── 尾椎點位初始相對位置 ─────────────────────────────────
const TAIL_INITIAL_POSITIONS = [
    { x: 0.42, y: 0.50 },
    { x: 0.34, y: 0.70 },
    { x: 0.34, y: 0.50 },
];

const initTailPoints = (containerWidth, containerHeight) =>
    TAIL_INITIAL_POSITIONS.map((pos, index) => ({
        id: index,
        x: pos.x * containerWidth,
        y: pos.y * containerHeight,
        isDraggable: index === 0,
    }));

// ─── 尾椎量測指標建構 ────────────────────────────────────
const buildTailMetrics = (scaleFactor, currentPoints) => {
    if (currentPoints.length < 3) return null;
    const [p1, p2, p3] = currentPoints;

    const distance12 = calculateDistance(p1, p2);
    const distance23 = calculateDistance(p2, p3);
    const distance13 = calculateDistance(p1, p3);

    // 計算點 2 處的夾角 (1-2-3)
    const v21 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v23 = { x: p3.x - p2.x, y: p3.y - p2.y };
    const dotProduct = v21.x * v23.x + v21.y * v23.y;
    const mag21 = Math.sqrt(v21.x * v21.x + v21.y * v21.y);
    const mag23 = Math.sqrt(v23.x * v23.x + v23.y * v23.y);
    const angle123 = Math.acos(dotProduct / (mag21 * mag23)) * 180 / Math.PI;

    return {
        distance12,
        distance12Cm: convertPxToCm(distance12, scaleFactor),
        distance23,
        distance23Cm: convertPxToCm(distance23, scaleFactor),
        distance13,
        distance13Cm: convertPxToCm(distance13, scaleFactor),
        angle123,
    };
};

// ─── 儲存酬載建構 ────────────────────────────────────────
const buildTailSavePayload = ({ points, lines, calculationResults, backgroundImage, currentScale, scaleFactorState }) => ({
    analysisType: 'tail',
    analysisData: {
        scale: currentScale,
        timestamp: new Date().toISOString(),
        metrics: buildTailMetrics(scaleFactorState, points),
    },
    points,
    lines,
    intersectionPoints: [],
    calculationResults,
    backgroundImage: backgroundImage !== neckPatientImage ? backgroundImage : '',
});

function AnalysisTail() {
    const tailContainerRef = useRef(null);
    const tailContainerWrapperRef = useRef(null);

    const {
        currentScale, points,
        calculationResults, setCalculationResults,
        isCalculated, setIsCalculated,
        setLines,
        showSaveOptions, showCustomerModal, customerList,
        showBlankScreen, scaleFactorState, setScaleFactorState,
        handleMouseDown, handleZoomIn, handleZoomOut,
        handleGoToPhotoCapture, handleSaveResult,
        handleBindCustomer, handleCreateNewCustomer,
        handleSelectCustomer, handleCloseModals,
        handleToggleBlankScreen, getContainerStyle,
        minScale, maxScale,
    } = useAnalysisBase({
        containerRef: tailContainerRef,
        wrapperRef: tailContainerWrapperRef,
        analysisType: 'tail',
        defaultBgPosition: 'center bottom',
        minScale: 0.6,
        maxScale: 2.0,
        scaleStep: 0.1,
        applyConstraints: applyTailPointConstraints,
        initPointsFn: initTailPoints,
        buildSavePayload: buildTailSavePayload,
    });

    // ─── 尾椎專用：計算結果格式化 ─────────────────────────
    const computeResults = (scaleFactor) => {
        if (points.length < 3) return;
        const metrics = buildTailMetrics(scaleFactor, points);
        if (!metrics) return;

        const formatDist = (px) =>
            formatDistanceWithMode(px, showBlankScreen, (p) => formatPxCmText(p, scaleFactor));

        setCalculationResults([
            '=== 尾椎量測結果 ===',
            `點 1-2 距離：${formatDist(metrics.distance12)}`,
            `點 2-3 距離：${formatDist(metrics.distance23)}`,
            `點 1-3 距離：${formatDist(metrics.distance13)}`,
            `∠123 夾角：${metrics.angle123.toFixed(2)}°`,
        ]);
    };

    // ─── 計算 & 比例尺變更 ────────────────────────────────
    const handleCalculate = () => {
        if (points.length < 3) return;
        if (!buildTailMetrics(scaleFactorState, points)) return;

        setLines([
            { id: 'tail-line-1', type: 'diagonal', start: points[0], end: points[1] },
            { id: 'tail-line-2', type: 'diagonal', start: points[1], end: points[2] },
        ]);
        computeResults(scaleFactorState);
        setIsCalculated(true);
    };

    const handleScaleFactorChange = (newScaleFactor) => {
        setScaleFactorState(newScaleFactor);
        if (isCalculated) computeResults(newScaleFactor);
    };

    // ─── 連線樣式 ─────────────────────────────────────────
    const getMeasurementLineStyle = (start, end) => {
        if (!start || !end) return null;
        const dist = calculateDistance(start, end);
        const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
        return {
            width: `${dist}px`,
            left: `${start.x}px`,
            top: `${start.y}px`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'left center',
        };
    };

    const lineStyle1 = points.length >= 2 ? getMeasurementLineStyle(points[0], points[1]) : null;
    const lineStyle2 = points.length >= 3 ? getMeasurementLineStyle(points[1], points[2]) : null;

    // ─── JSX ──────────────────────────────────────────────
    return (
        <div className="analysis-spine">
            <div className="analysis-content">
                <div className="neck-container-wrapper" ref={tailContainerWrapperRef}>
                    <div className="neck-calculation-results">
                        {calculationResults.length > 0 && (
                            <div className="calculation-results-content">
                                <h3>尾椎計算結果</h3>
                                <div className="results-list">
                                    {calculationResults.map((result, index) => (
                                        <div key={index} className="result-item">{result}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="neck-container" ref={tailContainerRef} style={getContainerStyle()}>
                        {points.map((point, index) => (
                            <div
                                key={point.id}
                                className={`point ${point.isDraggable ? 'draggable' : ''}`}
                                style={{ left: `${point.x}px`, top: `${point.y}px` }}
                                onMouseDown={(e) => handleMouseDown(e, index)}
                                onTouchStart={(e) => handleMouseDown(e, index)}
                            >
                                {index + 1}
                            </div>
                        ))}

                        {lineStyle1 && <div className="connection-line" style={lineStyle1} />}
                        {lineStyle2 && <div className="connection-line" style={lineStyle2} />}

                        <ScaleIndicator
                            scaleFactor={scaleFactorState}
                            onScaleFactorChange={handleScaleFactorChange}
                            useScreenDPI={showBlankScreen}
                        />
                    </div>
                </div>
            </div>

            <div className="menu-bottom-second">
                <button onClick={handleZoomIn} disabled={currentScale >= maxScale}>+</button>
                <button onClick={handleZoomOut} disabled={currentScale <= minScale}>-</button>
            </div>

            <div className="menu-bottom">
                {!isCalculated ? (
                    <button onClick={handleCalculate} className="action-btn">計算</button>
                ) : (
                    <button onClick={handleSaveResult} className="action-btn">儲存結果</button>
                )}
                <span>&nbsp;&nbsp;&nbsp;</span>
                <button onClick={handleGoToPhotoCapture} className="action-btn">拍攝新照片</button>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <button onClick={handleToggleBlankScreen} className="action-btn">
                    {showBlankScreen ? '還原圖片' : '切換空白畫面'}
                </button>
            </div>

            {showSaveOptions && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>選擇保存方式</h3>
                        <div className="modal-buttons">
                            <button onClick={handleBindCustomer} className="action-btn">綁定客戶</button>
                            <button onClick={handleCreateNewCustomer} className="action-btn">新建客戶</button>
                            <button onClick={handleCloseModals} className="cancel-btn">取消</button>
                        </div>
                    </div>
                </div>
            )}

            {showCustomerModal && (
                <div className="modal-overlay">
                    <div className="modal-content customer-modal">
                        <h3>選擇客戶</h3>
                        <div className="customer-list">
                            {customerList.map(customer => (
                                <div key={customer.id} className="customer-item"
                                    onClick={() => handleSelectCustomer(customer)}
                                >
                                    <div className="customer-info">
                                        <div className="customer-name">{customer.name}</div>
                                        <div className="customer-details">
                                            {customer.phone && <span>電話: {customer.phone}</span>}
                                            {customer.email && <span>信箱: {customer.email}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleCloseModals} className="cancel-btn">取消</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AnalysisTail;

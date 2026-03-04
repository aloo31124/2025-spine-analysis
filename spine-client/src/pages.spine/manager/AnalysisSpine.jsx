import React, { useRef } from 'react';
import './AnalysisSpine.css';
import ScaleIndicator from '../../components/ScaleIndicator';
import { formatPxCmText } from '../../utils/scaleConversion';
import { formatDistanceWithMode } from '../../utils/screenConversion';
import { applyPointConstraints, initializePoints } from '../../utils/pointConstraints';
import useAnalysisBase, { calculateDistance, neckPatientImage } from '../../hooks/useAnalysisBase';

// ─── 儲存酬載建構（module-level，無元件狀態依賴） ──────
const buildSpineSavePayload = ({ points, lines, intersectionPoints, calculationResults, backgroundImage, currentScale }) => ({
    analysisType: 'spine',
    analysisData: { scale: currentScale, timestamp: new Date().toISOString() },
    points,
    lines,
    intersectionPoints,
    calculationResults,
    backgroundImage: backgroundImage !== neckPatientImage ? backgroundImage : '',
});

function AnalysisSpine() {
    const neckContainerRef = useRef(null);
    const neckContainerWrapperRef = useRef(null);

    const {
        currentScale, points,
        calculationResults, setCalculationResults,
        isCalculated, setIsCalculated,
        lines, setLines,
        intersectionPoints, setIntersectionPoints,
        showSaveOptions, showCustomerModal, customerList,
        showBlankScreen, scaleFactorState, setScaleFactorState,
        handleMouseDown, handleZoomIn, handleZoomOut,
        handleGoToPhotoCapture, handleSaveResult,
        handleBindCustomer, handleCreateNewCustomer,
        handleSelectCustomer, handleCloseModals,
        handleToggleBlankScreen, getContainerStyle,
        minScale, maxScale,
    } = useAnalysisBase({
        containerRef: neckContainerRef,
        wrapperRef: neckContainerWrapperRef,
        analysisType: 'spine',
        defaultBgPosition: 'center top',
        minScale: 0.5,
        maxScale: 2.0,
        scaleStep: 0.1,
        applyConstraints: applyPointConstraints,
        initPointsFn: initializePoints,
        buildSavePayload: buildSpineSavePayload,
    });

    // ─── 頸椎專用：三點夾角計算 ───────────────────────────
    const calculateAngleBetweenThreePoints = (pointA, vertex, pointC) => {
        const vectorAV = { x: pointA.x - vertex.x, y: pointA.y - vertex.y };
        const vectorCV = { x: pointC.x - vertex.x, y: pointC.y - vertex.y };
        const dotProduct = vectorAV.x * vectorCV.x + vectorAV.y * vectorCV.y;
        const magnitudeAV = Math.sqrt(vectorAV.x * vectorAV.x + vectorAV.y * vectorAV.y);
        const magnitudeCV = Math.sqrt(vectorCV.x * vectorCV.x + vectorCV.y * vectorCV.y);

        if (magnitudeAV === 0 || magnitudeCV === 0) return 0;

        const cosAngle = Math.max(-1, Math.min(1, dotProduct / (magnitudeAV * magnitudeCV)));
        return Math.acos(cosAngle) * 180 / Math.PI;
    };

    // ─── 頸椎專用：線段交點計算 ───────────────────────────
    const calculateLineIntersection = (horizontalPoint, horizontalType, diagonalPoint1, diagonalPoint2) => {
        if (horizontalType !== 'horizontal') return null;
        const y = horizontalPoint.y;
        const dx = diagonalPoint2.x - diagonalPoint1.x;
        const dy = diagonalPoint2.y - diagonalPoint1.y;
        if (dy === 0) return null;

        const t = (y - diagonalPoint1.y) / dy;
        if (t >= 0 && t <= 1) return { x: diagonalPoint1.x + t * dx, y };
        return null;
    };

    // ─── 頸椎專用：特殊線條與交點 ─────────────────────────
    const calculateSpecialLines = () => {
        const newLines = [];
        const newIntersectionPoints = [];

        // 點1—點4 連線
        newLines.push({ id: 'line14', type: 'diagonal', start: points[0], end: points[3] });
        // 點3 水平線
        newLines.push({ id: 'horizontal3', type: 'horizontal', point: points[2] });
        // 點5 垂直線
        newLines.push({ id: 'vertical5', type: 'vertical', point: points[4] });

        // 水平線3 與 線14 的交點（點7）
        const intersection6 = calculateLineIntersection(points[2], 'horizontal', points[0], points[3]);
        if (intersection6) {
            newIntersectionPoints.push({ id: '7', ...intersection6 });
            newLines.push({ id: 'line56', type: 'diagonal', start: points[4], end: intersection6 });
        }

        // 水平線3 與 垂直線5 的交點（點8）
        newIntersectionPoints.push({ id: '8', x: points[4].x, y: points[2].y });

        setLines(newLines);
        setIntersectionPoints(newIntersectionPoints);
    };

    // ─── 頸椎專用：距離 & 角度計算 ────────────────────────
    const calculateAllDistancesAndAngles = (scaleFactor) => {
        const sf = scaleFactor !== undefined ? scaleFactor : scaleFactorState;
        const results = [];

        results.push('=== 點之間的距離 ===');
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const distance = calculateDistance(points[i], points[j]);
                const formatted = formatDistanceWithMode(
                    distance, showBlankScreen, (px) => formatPxCmText(px, sf),
                );
                results.push(`點${i + 1} 到 點${j + 1}: ${formatted}`);
            }
        }

        // 點3-點7 距離（水平線3 與 線14 的交點）
        const dy14 = points[3].y - points[0].y;
        if (dy14 !== 0) {
            const t7 = (points[2].y - points[0].y) / dy14;
            if (t7 >= 0 && t7 <= 1) {
                const intersection7 = {
                    x: points[0].x + t7 * (points[3].x - points[0].x),
                    y: points[2].y,
                };
                const dist37 = calculateDistance(points[2], intersection7);
                const formatted37 = formatDistanceWithMode(dist37, showBlankScreen, (px) => formatPxCmText(px, sf));
                results.push(`點3 到 點7: ${formatted37}`);
            }
        }

        // 點5-點8 距離（水平線3 與 垂直線5 的交點）
        const intersection8 = { x: points[4].x, y: points[2].y };
        const dist58 = calculateDistance(points[4], intersection8);
        const formatted58 = formatDistanceWithMode(dist58, showBlankScreen, (px) => formatPxCmText(px, sf));
        results.push(`點5 到 點8: ${formatted58}`);

        results.push('');
        results.push('=== 點之間的角度 ===');
        for (let i = 0; i < points.length; i++) {
            for (let j = 0; j < points.length; j++) {
                for (let k = j + 1; k < points.length; k++) {
                    if (i !== j && i !== k && j !== k) {
                        const angle = calculateAngleBetweenThreePoints(points[j], points[i], points[k]);
                        results.push(`∠點${j + 1}-點${i + 1}-點${k + 1}: ${angle.toFixed(1)}°`);
                    }
                }
            }
        }

        setCalculationResults(results);
    };

    // ─── 計算 & 比例尺變更 ────────────────────────────────
    const handleCalculate = () => {
        calculateSpecialLines();
        calculateAllDistancesAndAngles();
        setIsCalculated(true);
    };

    const handleScaleFactorChange = (newScaleFactor) => {
        setScaleFactorState(newScaleFactor);
        if (isCalculated) calculateAllDistancesAndAngles(newScaleFactor);
    };

    // ─── 線條渲染 ─────────────────────────────────────────
    const renderLine = (line) => {
        if (line.type === 'diagonal') {
            const length = Math.sqrt(
                Math.pow(line.end.x - line.start.x, 2) + Math.pow(line.end.y - line.start.y, 2),
            );
            const angle = Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x) * 180 / Math.PI;
            return (
                <div key={line.id} className="special-line diagonal-line"
                    style={{ left: `${line.start.x}px`, top: `${line.start.y}px`, width: `${length}px`, transform: `rotate(${angle}deg)` }}
                />
            );
        }
        if (line.type === 'horizontal') {
            return (
                <div key={line.id} className="special-line horizontal-line"
                    style={{ left: '0px', top: `${line.point.y}px`, width: '100%' }}
                />
            );
        }
        if (line.type === 'vertical') {
            return (
                <div key={line.id} className="special-line vertical-line"
                    style={{ left: `${line.point.x}px`, top: '0px', height: '100%' }}
                />
            );
        }
        return null;
    };

    // ─── JSX ──────────────────────────────────────────────
    return (
        <div className="analysis-spine">
            <div className="analysis-content">
                <div className="neck-container-wrapper" ref={neckContainerWrapperRef}>
                    <div className="neck-calculation-results">
                        {calculationResults.length > 0 && (
                            <div className="calculation-results-content">
                                <h3>計算結果</h3>
                                <div className="results-list">
                                    {calculationResults.map((result, index) => (
                                        <div key={index} className="result-item">{result}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="neck-container" ref={neckContainerRef} style={getContainerStyle()}>
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

                        {lines.map(renderLine)}

                        {intersectionPoints.map(point => (
                            <div
                                key={point.id}
                                className="intersection-point"
                                style={{ left: `${point.x}px`, top: `${point.y}px` }}
                            >
                                {point.id}
                            </div>
                        ))}

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

export default AnalysisSpine;

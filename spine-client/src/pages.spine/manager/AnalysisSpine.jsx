import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AnalysisSpine.css';
import neckPatientImage from '../../assets.spine/images/病患側面.png';
import ScaleIndicator from '../../components/ScaleIndicator';
import AnalysisBottomBar from '../../components/AnalysisBottomBar';
import AnalysisModals from '../../components/AnalysisModals';
import { useAnalysisDrag } from '../../hooks/useAnalysisDrag';
import { useAnalysisPhoto } from '../../hooks/useAnalysisPhoto';
import { useAnalysisZoom } from '../../hooks/useAnalysisZoom';
import { useAnalysisSave } from '../../hooks/useAnalysisSave';
import { formatPxCmText } from '../../utils/scaleConversion';
import { formatDistanceWithMode } from '../../utils/screenConversion';
import { calculateDistance, calculateAngle } from '../../utils/geometry';
import {
    applyPointConstraints,
    initializePoints,
    initializePointsFromRelative
} from '../../utils/pointConstraints';

function AnalysisSpine() {
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);

    // 比例尺縮放因子
    const [scaleFactorState, setScaleFactorState] = useState(1.0);

    /* ========== 共用 Hooks ========== */

    const drag = useAnalysisDrag({ containerRef, constraintFn: applyPointConstraints });

    const photo = useAnalysisPhoto({
        defaultImage: neckPatientImage,
        defaultBgPosition: 'center top',
        locationState: location.state,
        onPointsReceived: (relativePoints, imageSize) => {
            const container = containerRef.current;
            if (!container) return;
            const newPoints = initializePointsFromRelative(
                relativePoints, imageSize, container.offsetWidth, container.offsetHeight
            );
            drag.resetPoints(newPoints);
        }
    });

    const zoom = useAnalysisZoom({ wrapperRef, minScale: 0.5, maxScale: 2.0, scaleStep: 0.1 });

    const save = useAnalysisSave({
        buildPayloadFn: () => ({
            analysisType: 'spine',
            analysisData: {
                scale: zoom.currentScale,
                timestamp: new Date().toISOString()
            },
            points: drag.points,
            lines: drag.lines,
            intersectionPoints: drag.intersectionPoints,
            calculationResults: drag.calculationResults,
            backgroundImage: photo.backgroundImage !== neckPatientImage ? photo.backgroundImage : ''
        }),
        navigate
    });

    // 初始化點位
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        drag.resetPoints(initializePoints(container.offsetWidth, container.offsetHeight));
    }, []);

    /* ========== Spine 專有：計算邏輯 ========== */

    const handleScaleFactorChange = (newScaleFactor) => {
        setScaleFactorState(newScaleFactor);
        if (drag.isCalculated) {
            calculateAllDistancesAndAngles(newScaleFactor);
        }
    };

    const handleCalculate = () => {
        calculateSpecialLines();
        calculateAllDistancesAndAngles();
        drag.setIsCalculated(true);
    };

    // 計算所有點之間的距離和角度
    const calculateAllDistancesAndAngles = (scaleFactor) => {
        const sf = scaleFactor !== undefined ? scaleFactor : scaleFactorState;
        const pts = drag.points;
        const results = [];

        results.push('=== 點之間的距離 ===');
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const dist = calculateDistance(pts[i], pts[j]);
                const formatted = formatDistanceWithMode(
                    dist,
                    photo.showBlankScreen,
                    (px) => formatPxCmText(px, sf)
                );
                results.push(`點${i + 1} 到 點${j + 1}: ${formatted}`);
            }
        }

        results.push('');
        results.push('=== 點之間的角度 ===');
        for (let i = 0; i < pts.length; i++) {
            for (let j = 0; j < pts.length; j++) {
                for (let k = j + 1; k < pts.length; k++) {
                    if (i !== j && i !== k && j !== k) {
                        const angle = calculateAngle(pts[j], pts[i], pts[k]);
                        results.push(`∠點${j + 1}-點${i + 1}-點${k + 1}: ${angle.toFixed(1)}°`);
                    }
                }
            }
        }
        drag.setCalculationResults(results);
    };

    // 計算特殊線條和交點
    const calculateSpecialLines = () => {
        const pts = drag.points;
        const newLines = [];
        const newIntersectionPoints = [];

        // 點1→點4 連線
        newLines.push({ id: 'line14', type: 'diagonal', start: pts[0], end: pts[3] });
        // 點3 水平線
        newLines.push({ id: 'horizontal3', type: 'horizontal', point: pts[2] });
        // 點5 垂直線
        newLines.push({ id: 'vertical5', type: 'vertical', point: pts[4] });

        // 水平線3 與 線14 的交點（點6）
        const intersection6 = calculateLineIntersection(pts[2], 'horizontal', pts[0], pts[3]);
        if (intersection6) {
            newIntersectionPoints.push({ id: '6', ...intersection6 });
        }
        // 水平線3 與 垂直線5 的交點（點7）
        newIntersectionPoints.push({ id: '7', x: pts[4].x, y: pts[2].y });

        // 點5→點6 連線
        if (intersection6) {
            newLines.push({ id: 'line56', type: 'diagonal', start: pts[4], end: intersection6 });
        }

        drag.setLines(newLines);
        drag.setIntersectionPoints(newIntersectionPoints);
    };

    const calculateLineIntersection = (horizontalPoint, horizontalType, diagonalPoint1, diagonalPoint2) => {
        if (horizontalType === 'horizontal') {
            const y = horizontalPoint.y;
            const dx = diagonalPoint2.x - diagonalPoint1.x;
            const dy = diagonalPoint2.y - diagonalPoint1.y;
            if (dy === 0) return null;
            const t = (y - diagonalPoint1.y) / dy;
            if (t >= 0 && t <= 1) {
                return { x: diagonalPoint1.x + t * dx, y };
            }
        }
        return null;
    };

    /* ========== JSX ========== */

    return (
        <div className="analysis-spine">
            <div className="analysis-content">
                <div className="neck-container-wrapper" ref={wrapperRef}>
                    <div className="neck-calculation-results">
                        {drag.calculationResults.length > 0 && (
                            <div className="calculation-results-content">
                                <h3>計算結果</h3>
                                <div className="results-list">
                                    {drag.calculationResults.map((result, index) => (
                                        <div key={index} className="result-item">{result}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div
                        className="neck-container"
                        ref={containerRef}
                        style={photo.getContainerStyle()}
                    >
                        {/* 渲染點位 */}
                        {drag.points.map((point, index) => (
                            <div
                                key={point.id}
                                className={`point ${point.isDraggable ? 'draggable' : ''}`}
                                style={{ left: `${point.x}px`, top: `${point.y}px` }}
                                onMouseDown={(e) => drag.handleMouseDown(e, index)}
                                onTouchStart={(e) => drag.handleMouseDown(e, index)}
                            >
                                {index + 1}
                            </div>
                        ))}

                        {/* 渲染線條 */}
                        {drag.lines.map(line => {
                            if (line.type === 'diagonal') {
                                const length = Math.sqrt(
                                    Math.pow(line.end.x - line.start.x, 2) +
                                    Math.pow(line.end.y - line.start.y, 2)
                                );
                                const angle = Math.atan2(
                                    line.end.y - line.start.y,
                                    line.end.x - line.start.x
                                ) * 180 / Math.PI;
                                return (
                                    <div
                                        key={line.id}
                                        className="special-line diagonal-line"
                                        style={{
                                            left: `${line.start.x}px`,
                                            top: `${line.start.y}px`,
                                            width: `${length}px`,
                                            transform: `rotate(${angle}deg)`
                                        }}
                                    />
                                );
                            } else if (line.type === 'horizontal') {
                                return (
                                    <div
                                        key={line.id}
                                        className="special-line horizontal-line"
                                        style={{ left: '0px', top: `${line.point.y}px`, width: '100%' }}
                                    />
                                );
                            } else if (line.type === 'vertical') {
                                return (
                                    <div
                                        key={line.id}
                                        className="special-line vertical-line"
                                        style={{ left: `${line.point.x}px`, top: '0px', height: '100%' }}
                                    />
                                );
                            }
                            return null;
                        })}

                        {/* 渲染交點 */}
                        {drag.intersectionPoints.map(point => (
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
                            useScreenDPI={photo.showBlankScreen}
                        />
                    </div>
                </div>
            </div>

            <AnalysisBottomBar
                isCalculated={drag.isCalculated}
                onCalculate={handleCalculate}
                onSave={save.handleSaveResult}
                onPhoto={() => navigate('/manager/photo/capture')}
                onToggleBlank={photo.handleToggleBlankScreen}
                showBlankScreen={photo.showBlankScreen}
                currentScale={zoom.currentScale}
                minScale={zoom.minScale}
                maxScale={zoom.maxScale}
                onZoomIn={zoom.handleZoomIn}
                onZoomOut={zoom.handleZoomOut}
            />

            <AnalysisModals
                showSaveOptions={save.showSaveOptions}
                showCustomerModal={save.showCustomerModal}
                customerList={save.customerList}
                onBindCustomer={save.handleBindCustomer}
                onCreateNew={save.handleCreateNewCustomer}
                onSelectCustomer={save.handleSelectCustomer}
                onClose={save.handleCloseModals}
            />
        </div>
    );
}

export default AnalysisSpine;
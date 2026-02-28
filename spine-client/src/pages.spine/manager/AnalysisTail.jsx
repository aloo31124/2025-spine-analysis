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
import { convertPxToCm, formatPxCmText } from '../../utils/scaleConversion';
import { formatDistanceWithMode } from '../../utils/screenConversion';
import { calculateDistance, calculateAngle } from '../../utils/geometry';
import { applyTailPointConstraints, initializePointsFromRelative } from '../../utils/pointConstraints';

// 三個尾椎參考點的初始相對位置（以容器寬高的比例表示）
const TAIL_INITIAL_POSITIONS = [
    { x: 0.42, y: 0.50 },
    { x: 0.34, y: 0.70 },
    { x: 0.34, y: 0.50 }
];

function AnalysisTail() {
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);

    // 比例尺縮放因子
    const [scaleFactorState, setScaleFactorState] = useState(1.0);

    /* ========== 共用 Hooks ========== */

    const drag = useAnalysisDrag({ containerRef, constraintFn: applyTailPointConstraints });

    const photo = useAnalysisPhoto({
        defaultImage: neckPatientImage,
        defaultBgPosition: 'center bottom',
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

    const zoom = useAnalysisZoom({ wrapperRef, minScale: 0.6, maxScale: 2.0, scaleStep: 0.1 });

    const save = useAnalysisSave({
        buildPayloadFn: () => ({
            analysisType: 'tail',
            analysisData: {
                scale: zoom.currentScale,
                timestamp: new Date().toISOString(),
                metrics: buildTailMetrics(scaleFactorState, drag.points)
            },
            points: drag.points,
            lines: drag.lines,
            intersectionPoints: [],
            calculationResults: drag.calculationResults,
            backgroundImage: photo.backgroundImage !== neckPatientImage ? photo.backgroundImage : ''
        }),
        navigate
    });

    // 初始化點位
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const newPoints = TAIL_INITIAL_POSITIONS.map((pos, index) => ({
            id: index,
            x: pos.x * container.offsetWidth,
            y: pos.y * container.offsetHeight,
            isDraggable: index === 0
        }));
        drag.resetPoints(newPoints);
    }, []);

    /* ========== Tail 專有：計算邏輯 ========== */

    // 建立尾椎量測指標
    const buildTailMetrics = (scaleFactor, currentPoints) => {
        const sf = scaleFactor !== undefined ? scaleFactor : scaleFactorState;
        const pts = currentPoints !== undefined ? currentPoints : drag.points;
        if (pts.length < 3) return null;
        const [p1, p2, p3] = pts;

        const distance12 = calculateDistance(p1, p2);
        const distance23 = calculateDistance(p2, p3);
        const distance13 = calculateDistance(p1, p3);
        const angle123 = calculateAngle(p1, p2, p3);

        return {
            distance12, distance12Cm: convertPxToCm(distance12, sf),
            distance23, distance23Cm: convertPxToCm(distance23, sf),
            distance13, distance13Cm: convertPxToCm(distance13, sf),
            angle123
        };
    };

    // 格式化尾椎量測結果
    const formatTailResults = (metrics, scaleFactor) => {
        const fmt = (px) => formatDistanceWithMode(
            px, photo.showBlankScreen,
            (p) => formatPxCmText(p, scaleFactor)
        );
        return [
            '=== 尾椎量測結果 ===',
            `點 1-2 距離：${fmt(metrics.distance12)}`,
            `點 2-3 距離：${fmt(metrics.distance23)}`,
            `點 1-3 距離：${fmt(metrics.distance13)}`,
            `∠123 夾角：${metrics.angle123.toFixed(2)}°`
        ];
    };

    const handleCalculate = () => {
        if (drag.points.length < 3) return;
        const metrics = buildTailMetrics(scaleFactorState, drag.points);
        if (!metrics) return;

        drag.setLines([
            { id: 'tail-line-1', type: 'diagonal', start: drag.points[0], end: drag.points[1] },
            { id: 'tail-line-2', type: 'diagonal', start: drag.points[1], end: drag.points[2] }
        ]);
        drag.setCalculationResults(formatTailResults(metrics, scaleFactorState));
        drag.setIsCalculated(true);
    };

    const handleScaleFactorChange = (newScaleFactor) => {
        setScaleFactorState(newScaleFactor);
        if (drag.isCalculated) {
            const metrics = buildTailMetrics(newScaleFactor, drag.points);
            if (metrics) {
                drag.setCalculationResults(formatTailResults(metrics, newScaleFactor));
            }
        }
    };

    // 連線樣式
    const getMeasurementLineStyle = (start, end) => {
        if (!start || !end) return null;
        const dist = calculateDistance(start, end);
        const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
        return {
            width: `${dist}px`,
            left: `${start.x}px`,
            top: `${start.y}px`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'left center'
        };
    };

    const lineStyle1 = drag.points.length >= 2 ? getMeasurementLineStyle(drag.points[0], drag.points[1]) : null;
    const lineStyle2 = drag.points.length >= 3 ? getMeasurementLineStyle(drag.points[1], drag.points[2]) : null;

    /* ========== JSX ========== */

    return (
        <div className="analysis-spine">
            <div className="analysis-content">
                <div className="neck-container-wrapper" ref={wrapperRef}>
                    <div className="neck-calculation-results">
                        {drag.calculationResults.length > 0 && (
                            <div className="calculation-results-content">
                                <h3>尾椎計算結果</h3>
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

                        {lineStyle1 && <div className="connection-line" style={lineStyle1} />}
                        {lineStyle2 && <div className="connection-line" style={lineStyle2} />}

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

export default AnalysisTail;

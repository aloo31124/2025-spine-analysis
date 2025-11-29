import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnalysisSpine.css';
import neckPatientImage from '../../assets.spine/images/病患側面.png';
import { addCustomerAnalysisResult } from '../../api/manager/customerAnalysisResult';
import { getCustomerList } from '../../api/manager/customer';
import ScaleIndicator from '../../components/ScaleIndicator';
import { convertPxToCm, formatPxCmText } from '../../utils/scaleConversion';

function AnalysisTail() {
    const navigate = useNavigate();
    const tailContainerRef = useRef(null);
    const tailContainerWrapperRef = useRef(null);

    const [backgroundImage, setBackgroundImage] = useState(neckPatientImage);
    const [currentScale, setCurrentScale] = useState(1);
    const minScale = 0.6;
    const maxScale = 2.0;
    const scaleStep = 0.1;

    // 兩個尾椎參考點的初始相對位置 (以容器寬高的比例表示)
    const initialPointPositions = [
        { x: 0.42, y: 0.68 },
        { x: 0.48, y: 0.88 }
    ];

    const [points, setPoints] = useState([]);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [calculationResults, setCalculationResults] = useState([]);
    const [isCalculated, setIsCalculated] = useState(false);
    const [lines, setLines] = useState([]);
    const intersectionPoints = [];

    const [showSaveOptions, setShowSaveOptions] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerList, setCustomerList] = useState([]);

    useEffect(() => {
        initPoints();
    }, []);

    useEffect(() => {
        const storedPhoto = localStorage.getItem('spineAnalysisPhoto');
        const photoTimestamp = localStorage.getItem('spineAnalysisPhotoTimestamp');

        if (storedPhoto && photoTimestamp) {
            const now = Date.now();
            const timestamp = parseInt(photoTimestamp, 10);
            const maxAge = 24 * 60 * 60 * 1000;

            if (now - timestamp < maxAge) {
                setBackgroundImage(storedPhoto);
                localStorage.removeItem('spineAnalysisPhoto');
                localStorage.removeItem('spineAnalysisPhotoTimestamp');
            }
        }
    }, []);

    

    const initPoints = () => {
        const container = tailContainerRef.current;
        if (!container) return;

        const newPoints = initialPointPositions.map((pos, index) => ({
            id: index,
            x: pos.x * container.offsetWidth,
            y: pos.y * container.offsetHeight,
            isDraggable: index === 0
        }));

        setPoints(newPoints);
        setCurrentPointIndex(0);
        setCalculationResults([]);
        setIsCalculated(false);
        setLines([]);
    };

    const setDraggablePoint = (index) => {
        setPoints(prevPoints =>
            prevPoints.map((point, i) => ({
                ...point,
                isDraggable: i === index
            }))
        );
        setCurrentPointIndex(index);
    };

    const handleMouseDown = (event, pointIndex) => {
        if (points[pointIndex] && !points[pointIndex].isDraggable) return;

        event.preventDefault();
        setIsDragging(true);

        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        const container = tailContainerRef.current;
        const rect = container.getBoundingClientRect();

        setDragStart({
            x: clientX - rect.left - points[pointIndex].x,
            y: clientY - rect.top - points[pointIndex].y
        });
    };

    const handleMouseMove = (event) => {
        if (!isDragging || !tailContainerRef.current) return;

        event.preventDefault();
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;

        const container = tailContainerRef.current;
        const rect = container.getBoundingClientRect();

        let newX = clientX - rect.left - dragStart.x;
        let newY = clientY - rect.top - dragStart.y;

        newX = Math.max(0, Math.min(container.offsetWidth - 10, newX));
        newY = Math.max(0, Math.min(container.offsetHeight - 10, newY));

        setPoints(prevPoints =>
            prevPoints.map((point, index) =>
                index === currentPointIndex ? { ...point, x: newX, y: newY } : point
            )
        );
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMove = (event) => handleMouseMove(event);
        const handleUp = () => handleMouseUp();

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleUp);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handlePrevPoint = () => {
        if (currentPointIndex > 0) {
            setDraggablePoint(currentPointIndex - 1);
        }
    };

    const handleNextPoint = () => {
        if (currentPointIndex < points.length - 1) {
            setDraggablePoint(currentPointIndex + 1);
        }
    };

    const applyScale = (scale) => {
        if (!tailContainerWrapperRef.current) return;
        tailContainerWrapperRef.current.style.transform = `scale(${scale})`;
        tailContainerWrapperRef.current.style.transformOrigin = 'center top';
        setCurrentScale(scale);
    };

    const handleZoomIn = () => {
        const newScale = Math.min(currentScale + scaleStep, maxScale);
        applyScale(newScale);
    };

    const handleZoomOut = () => {
        const newScale = Math.max(currentScale - scaleStep, minScale);
        applyScale(newScale);
    };

    const handleReset = () => {
        setBackgroundImage(neckPatientImage);
        applyScale(1);
        initPoints();
        setShowSaveOptions(false);
        setShowCustomerModal(false);
    };

    const handleUseOriginalImage = () => {
        setBackgroundImage(neckPatientImage);
        initPoints();
    };

    const handleGoToPhotoCapture = () => {
        navigate('/manager/photo/capture');
    };

    const calculateDistance = (pointA, pointB) => {
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const buildTailMetrics = () => {
        if (points.length < 2) return null;
        const [p1, p2] = points;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = calculateDistance(p1, p2);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const horizontalShiftAbs = Math.abs(dx);
        const verticalShiftAbs = Math.abs(dy);

        return {
            distance,
            distanceCm: convertPxToCm(distance),
            horizontalShift: dx,
            horizontalShiftAbs,
            horizontalShiftCm: convertPxToCm(horizontalShiftAbs),
            verticalShift: dy,
            verticalShiftAbs,
            verticalShiftCm: convertPxToCm(verticalShiftAbs),
            horizontalAngle: angle
        };
    };

    const handleCalculate = () => {
        if (points.length < 2) return;

        const metrics = buildTailMetrics();
        if (!metrics) return;

        setLines([
            {
                id: 'tail-line',
                type: 'diagonal',
                start: points[0],
                end: points[1]
            }
        ]);

        setCalculationResults([
            '=== 尾椎量測結果 ===',
            `點 1-2 距離：${formatPxCmText(metrics.distance)}`,
            `水平位移：${formatPxCmText(metrics.horizontalShiftAbs)} (${metrics.horizontalShift >= 0 ? '向右' : '向左'})`,
            `垂直位移：${formatPxCmText(metrics.verticalShiftAbs)} (${metrics.verticalShift >= 0 ? '向下' : '向上'})`,
            `與水平夾角：${Math.abs(metrics.horizontalAngle).toFixed(2)}°`
        ]);
        setIsCalculated(true);
    };

    const handleSaveResult = () => {
        setShowSaveOptions(true);
    };

    const handleBindCustomer = async () => {
        try {
            const searchParam = {};
            const pagingParam = { pageIndex: 1, pageSize: 1000 };
            const response = await getCustomerList(searchParam, pagingParam);
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
            const pendingAnalysisData = {
                analysisType: 'tail',
                analysisData: {
                    scale: currentScale,
                    timestamp: new Date().toISOString(),
                    metrics: buildTailMetrics()
                },
                points,
                lines,
                intersectionPoints: [],
                calculationResults,
                backgroundImage: backgroundImage !== neckPatientImage ? backgroundImage : '',
                userId,
                createdAt: new Date().toISOString()
            };

            localStorage.setItem('pendingAnalysisData', JSON.stringify(pendingAnalysisData));
            setShowSaveOptions(false);
            navigate('/manager/customer/add');
        } catch (error) {
            console.error('處理新建客戶錯誤:', error);
            alert('處理新建客戶失敗');
        }
    };

    const handleSelectCustomer = async (customer) => {
        try {
            await saveAnalysisResult(customer.id);
            setShowCustomerModal(false);
            navigate('/manager/customer/edit/' + customer.id, { state: { customer } });
        } catch (error) {
            console.error('保存分析結果錯誤:', error);
            alert('保存分析結果失敗', error);
        }
    };

    const saveAnalysisResult = async (customerId) => {
        try {
            const userId = localStorage.getItem('userId') || 'default_user';
            const payload = {
                customerId,
                userId,
                analysisType: 'tail',
                analysisData: {
                    scale: currentScale,
                    timestamp: new Date().toISOString(),
                    metrics: buildTailMetrics()
                },
                points,
                lines,
                intersectionPoints: [],
                calculationResults,
                backgroundImage: backgroundImage !== neckPatientImage ? backgroundImage : ''
            };

            const response = await addCustomerAnalysisResult(payload);
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.error('保存分析結果錯誤:', error);
            throw error;
        }
    };

    const handleCloseModals = () => {
        setShowSaveOptions(false);
        setShowCustomerModal(false);
    };

    const getContainerStyle = () => {
        const style = {
            backgroundImage: `url(${backgroundImage})`
        };

        if (backgroundImage === neckPatientImage) {
            return {
                ...style,
                backgroundPosition: 'center bottom',
                backgroundSize: 'auto 180%'
            };
        }

        return {
            ...style,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
        };
    };

    const getMeasurementLineStyle = () => {
        if (points.length < 2) return null;
        const [start, end] = points;
        const distance = calculateDistance(start, end);
        const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;

        return {
            width: `${distance}px`,
            left: `${start.x}px`,
            top: `${start.y}px`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'left center'
        };
    };

    const lineStyle = getMeasurementLineStyle();

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
                                        <div key={index} className="result-item">
                                            {result}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div
                        className="neck-container"
                        ref={tailContainerRef}
                        style={getContainerStyle()}
                    >
                        {points.map((point, index) => (
                            <div
                                key={point.id}
                                className={`point ${point.isDraggable ? 'draggable' : ''}`}
                                style={{
                                    left: `${point.x}px`,
                                    top: `${point.y}px`
                                }}
                                onMouseDown={(event) => handleMouseDown(event, index)}
                                onTouchStart={(event) => handleMouseDown(event, index)}
                            >
                                {index + 1}
                            </div>
                        ))}

                        {lineStyle && (
                            <div
                                className="connection-line"
                                style={lineStyle}
                            />
                        )}

                        <ScaleIndicator />
                    </div>
                </div>
            </div>

            <div className="menu-bottom-second">
                <button onClick={handleZoomIn} disabled={currentScale >= maxScale}>+</button>
                <button onClick={handleZoomOut} disabled={currentScale <= minScale}>-</button>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <button onClick={handlePrevPoint} disabled={currentPointIndex === 0}>
                    &lt;
                </button>
                <button
                    onClick={handleNextPoint}
                    disabled={currentPointIndex === points.length - 1}
                    className="control-btn"
                >
                    &gt;
                </button>
            </div>

            <div className="menu-bottom">
                {!isCalculated ? (
                    <button onClick={handleCalculate} className="action-btn">
                        計算
                    </button>
                ) : (
                    <button onClick={handleSaveResult} className="action-btn">
                        儲存結果
                    </button>
                )}
                <span>&nbsp;&nbsp;&nbsp;</span>
                <button onClick={handleReset} className="action-btn">
                    重置
                </button>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <button onClick={handleGoToPhotoCapture} className="action-btn">
                    拍攝新照片
                </button>
                {backgroundImage !== neckPatientImage && (
                    <>
                        <span>&nbsp;&nbsp;&nbsp;</span>
                        <button onClick={handleUseOriginalImage} className="action-btn">
                            使用原始圖片
                        </button>
                    </>
                )}
            </div>

            {showSaveOptions && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>選擇保存方式</h3>
                        <div className="modal-buttons">
                            <button onClick={handleBindCustomer} className="action-btn">
                                綁定客戶
                            </button>
                            <button onClick={handleCreateNewCustomer} className="action-btn">
                                新建客戶
                            </button>
                            <button onClick={handleCloseModals} className="cancel-btn">
                                取消
                            </button>
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
                                <div
                                    key={customer.id}
                                    className="customer-item"
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
                            <button onClick={handleCloseModals} className="cancel-btn">
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AnalysisTail;

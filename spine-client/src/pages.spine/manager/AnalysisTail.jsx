import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AnalysisSpine.css';
import neckPatientImage from '../../assets.spine/images/病患側面.png';
import { addCustomerAnalysisResult } from '../../api/manager/customerAnalysisResult';
import { getCustomerList } from '../../api/manager/customer';
import ScaleIndicator from '../../components/ScaleIndicator';
import { convertPxToCm, formatPxCmText } from '../../utils/scaleConversion';
import { formatDistanceWithMode } from '../../utils/screenConversion';

function AnalysisTail() {
    const navigate = useNavigate();
    const location = useLocation();
    const tailContainerRef = useRef(null);
    const tailContainerWrapperRef = useRef(null);

    const [backgroundImage, setBackgroundImage] = useState(neckPatientImage);
    const [currentScale, setCurrentScale] = useState(1);
    const minScale = 0.6;
    const maxScale = 2.0;
    const scaleStep = 0.1;

    // 三個尾椎參考點的初始相對位置 (以容器寬高的比例表示)
    const initialPointPositions = [
        { x: 0.42, y: 0.50 },
        { x: 0.34, y: 0.70 },
        { x: 0.34, y: 0.50 }
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
    const [showBlankScreen, setShowBlankScreen] = useState(false);

    useEffect(() => {
        initPoints();
    }, []);

    // 從 React Router state 接收拍照頁面傳來的數據
    useEffect(() => {
        const analysisData = location.state;
        
        if (analysisData && analysisData.photo && analysisData.points) {
            // 使用傳遞過來的照片
            setBackgroundImage(analysisData.photo);
            
            // 使用傳遞過來的點位數據初始化
            if (analysisData.points && Array.isArray(analysisData.points) && analysisData.points.length > 0) {
                // 等待容器渲染完成後再初始化點位
                setTimeout(() => {
                    initPointsFromRelative(analysisData.points, analysisData.imageSize);
                }, 100);
            }
        }
    }, [location.state]);

    

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

    // 從相對位置初始化點位（用於從 PhotoCaptureDrag 接收數據）
    const initPointsFromRelative = (relativePoints, imageSize) => {
        const container = tailContainerRef.current;
        if (!container) return;

        // 如果没有图片尺寸信息，使用简单的转换（向后兼容）
        if (!imageSize || !imageSize.width || !imageSize.height) {
            const newPoints = relativePoints.map((pos, index) => ({
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
            return;
        }

        // 计算图片在容器中的实际显示尺寸（考虑 object-fit: contain）
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const imageAspect = imageSize.width / imageSize.height;
        const containerAspect = containerWidth / containerHeight;
        
        let displayWidth, displayHeight, offsetX, offsetY;
        
        if (containerAspect > imageAspect) {
            // 容器更宽，图片以高度为准
            displayHeight = containerHeight;
            displayWidth = displayHeight * imageAspect;
            offsetX = (containerWidth - displayWidth) / 2;
            offsetY = 0;
        } else {
            // 容器更高，图片以宽度为准
            displayWidth = containerWidth;
            displayHeight = displayWidth / imageAspect;
            offsetX = 0;
            offsetY = (containerHeight - displayHeight) / 2;
        }

        // 将相对位置（0-1）转换为容器内的绝对位置
        const newPoints = relativePoints.map((pos, index) => ({
            id: index,
            x: pos.x * displayWidth + offsetX,
            y: pos.y * displayHeight + offsetY,
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

    const handleGoToPhotoCapture = () => {
        navigate('/manager/photo/capture');
    };

    const calculateDistance = (pointA, pointB) => {
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const buildTailMetrics = () => {
        if (points.length < 3) return null;
        const [p1, p2, p3] = points;
        
        // 三點之間互相的距離
        const distance12 = calculateDistance(p1, p2);
        const distance23 = calculateDistance(p2, p3);
        const distance13 = calculateDistance(p1, p3);
        
        // 計算點 2 處的夾角 (1-2-3 的夾角)
        // 使用向量計算夾角
        const v21 = { x: p1.x - p2.x, y: p1.y - p2.y }; // 從點2指向點1的向量
        const v23 = { x: p3.x - p2.x, y: p3.y - p2.y }; // 從點2指向點3的向量
        
        // 點積
        const dotProduct = v21.x * v23.x + v21.y * v23.y;
        // 向量長度
        const mag21 = Math.sqrt(v21.x * v21.x + v21.y * v21.y);
        const mag23 = Math.sqrt(v23.x * v23.x + v23.y * v23.y);
        // 夾角 (弧度轉角度)
        const angle123 = Math.acos(dotProduct / (mag21 * mag23)) * 180 / Math.PI;

        return {
            distance12,
            distance12Cm: convertPxToCm(distance12),
            distance23,
            distance23Cm: convertPxToCm(distance23),
            distance13,
            distance13Cm: convertPxToCm(distance13),
            angle123
        };
    };

    const handleCalculate = () => {
        if (points.length < 3) return;

        const metrics = buildTailMetrics();
        if (!metrics) return;

        setLines([
            {
                id: 'tail-line-1',
                type: 'diagonal',
                start: points[0],
                end: points[1]
            },
            {
                id: 'tail-line-2',
                type: 'diagonal',
                start: points[1],
                end: points[2]
            }
        ]);

        // 使用共用的格式化函數，根據是否為空白畫面模式選擇轉換方式
        const formatDistance = (pxDistance) => formatDistanceWithMode(
            pxDistance,
            showBlankScreen,  // 空白畫面模式使用螢幕實際 DPI 轉換
            formatPxCmText    // 正常模式使用比例尺邏輯
        );

        setCalculationResults([
            '=== 尾椎量測結果 ===',
            `點 1-2 距離：${formatDistance(metrics.distance12)}`,
            `點 2-3 距離：${formatDistance(metrics.distance23)}`,
            `點 1-3 距離：${formatDistance(metrics.distance13)}`,
            `∠123 夾角：${metrics.angle123.toFixed(2)}°`
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
        // 如果顯示空白畫面，返回白色背景
        if (showBlankScreen) {
            return {
                backgroundColor: 'white',
                backgroundImage: 'none'
            };
        }

        const style = {
            backgroundImage: `url(${backgroundImage})`
        };

        if (backgroundImage === neckPatientImage) {
            return {
                ...style,
                backgroundPosition: 'center bottom',
                backgroundSize: 'auto 135%'
            };
        }

        return {
            ...style,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
        };
    };

    // 切換空白畫面
    const handleToggleBlankScreen = () => {
        setShowBlankScreen(!showBlankScreen);
    };

    const getMeasurementLineStyle = (start, end) => {
        if (!start || !end) return null;
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

    const lineStyle1 = points.length >= 2 ? getMeasurementLineStyle(points[0], points[1]) : null;
    const lineStyle2 = points.length >= 3 ? getMeasurementLineStyle(points[1], points[2]) : null;

    return (
        <div className="analysis-spine">
            <div className="analysis-content">
                <div className="neck-container-wrapper" ref={tailContainerWrapperRef}>
                    <div className="neck-calculation-results">
                        {/* 空白畫面模式提示訊息 */}
                        {showBlankScreen && (
                            <div className="blank-screen-notice" style={{
                                padding: '15px',
                                margin: '10px 0',
                                backgroundColor: '#fff3cd',
                                border: '2px solid #ffc107',
                                borderRadius: '8px',
                                color: '#856404',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                lineHeight: '1.6'
                            }}>
                                目前為空白畫面模式，距離計算將依照螢幕實際尺寸(公分)進行。請受測者身體緊貼於螢幕，確保測量準確。
                            </div>
                        )}
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

                        {lineStyle1 && (
                            <div
                                className="connection-line"
                                style={lineStyle1}
                            />
                        )}

                        {lineStyle2 && (
                            <div
                                className="connection-line"
                                style={lineStyle2}
                            />
                        )}

                        {!showBlankScreen && <ScaleIndicator />}
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
                <button onClick={handleGoToPhotoCapture} className="action-btn">
                    拍攝新照片
                </button>                <span>&nbsp;&nbsp;&nbsp;</span>
                <button onClick={handleToggleBlankScreen} className="action-btn">
                    {showBlankScreen ? '還原圖片' : '切換空白畫面'}
                </button>
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

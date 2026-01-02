import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AnalysisSpine.css';
import neckPatientImage from '../../assets.spine/images/病患側面.png';
import { addCustomerAnalysisResult } from '../../api/manager/customerAnalysisResult';
import { getCustomerList } from '../../api/manager/customer';
import ScaleIndicator from '../../components/ScaleIndicator';
import { formatPxCmText } from '../../utils/scaleConversion';
import { formatDistanceWithMode } from '../../utils/screenConversion';

function AnalysisSpine() {
    const navigate = useNavigate();
    const location = useLocation();
    const neckContainerRef = useRef(null);
    const neckContainerWrapperRef = useRef(null);
    
    // 背景圖片狀態
    const [backgroundImage, setBackgroundImage] = useState(neckPatientImage);
    
    // 縮放比例變量
    const [currentScale, setCurrentScale] = useState(1);
    const minScale = 0.5;
    const maxScale = 2.0;
    const scaleStep = 0.1;
    
    // 五個點的初始位置（相對於容器的比例位置）
    const initialPointPositions = [
        { x: 0.3, y: 0.1 },   // 頂部
        { x: 0.35, y: 0.2 },  // 左側
        { x: 0.37, y: 0.3 },  // 右側
        { x: 0.3, y: 0.41 },  // 左下
        { x: 0.24, y: 0.52 }  // 右下
    ];
    
    const [points, setPoints] = useState([]);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lines, setLines] = useState([]);
    const [intersectionPoints, setIntersectionPoints] = useState([]);
    const [calculationResults, setCalculationResults] = useState([]);
    
    // 新增狀態：保存結果相關
    const [showSaveOptions, setShowSaveOptions] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isCalculated, setIsCalculated] = useState(false);
    const [showBlankScreen, setShowBlankScreen] = useState(false);
    
    // 比例尺縮放因子狀態（預設為 1.0）
    const [scaleFactorState, setScaleFactorState] = useState(1.0);

    // 初始化點位
    useEffect(() => {
        initPoints();
    }, []);

    // 從 React Router state 或 localStorage 接收拍照頁面傳來的數據
    useEffect(() => {
        // 優先檢查 localStorage 中的照片數據（來自 PhotoCapture）
        const storedPhoto = localStorage.getItem('spineAnalysisPhoto');
        const storedTimestamp = localStorage.getItem('spineAnalysisPhotoTimestamp');
        
        if (storedPhoto && storedTimestamp) {
            // 檢查照片是否在 5 分鐘內上傳（避免使用過期的照片）
            const timestamp = parseInt(storedTimestamp, 10);
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (now - timestamp < fiveMinutes) {
                setBackgroundImage(storedPhoto);
                // 清除已使用的照片數據
                localStorage.removeItem('spineAnalysisPhoto');
                localStorage.removeItem('spineAnalysisPhotoTimestamp');
                return;
            }
        }
        
        // 如果 localStorage 沒有數據，則檢查 location.state（來自 PhotoCaptureDrag）
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
        const container = neckContainerRef.current;
        if (!container) return;

        const newPoints = initialPointPositions.map((pos, index) => ({
            id: index,
            x: pos.x * container.offsetWidth,
            y: pos.y * container.offsetHeight,
            isDraggable: index === 0
        }));
        
        setPoints(newPoints);
        setCurrentPointIndex(0);
        setLines([]);
        setIntersectionPoints([]);
        setCalculationResults([]);
    };

    // 從相對位置初始化點位（用於從 PhotoCaptureDrag 接收數據）
    const initPointsFromRelative = (relativePoints, imageSize) => {
        const container = neckContainerRef.current;
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
            setLines([]);
            setIntersectionPoints([]);
            setCalculationResults([]);
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
        setLines([]);
        setIntersectionPoints([]);
        setCalculationResults([]);
    };

    // 設置當前可拖拽的點
    const setDraggablePoint = (index) => {
        setPoints(prevPoints => 
            prevPoints.map((point, i) => ({
                ...point,
                isDraggable: i === index
            }))
        );
        setCurrentPointIndex(index);
    };

    // 開始拖拽（點擊任意點位即可切換並拖曳）
    const handleMouseDown = (e, pointIndex) => {
        e.preventDefault();
        
        // 點擊任意點位時，先將該點位設為當前可拖曳的點位
        if (points[pointIndex] && !points[pointIndex].isDraggable) {
            setDraggablePoint(pointIndex);
        }
        
        setIsDragging(true);
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const container = neckContainerRef.current;
        const rect = container.getBoundingClientRect();
        
        setDragStart({
            x: clientX - rect.left - points[pointIndex].x,
            y: clientY - rect.top - points[pointIndex].y
        });
    };

    // 拖拽中
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const container = neckContainerRef.current;
        const rect = container.getBoundingClientRect();
        
        let newX = clientX - rect.left - dragStart.x;
        let newY = clientY - rect.top - dragStart.y;
        
        // 限制點在容器範圍內
        newX = Math.max(0, Math.min(container.offsetWidth - 10, newX));
        newY = Math.max(0, Math.min(container.offsetHeight - 10, newY));
        
        setPoints(prevPoints =>
            prevPoints.map((point, index) =>
                index === currentPointIndex ? { ...point, x: newX, y: newY } : point
            )
        );
    };

    // 停止拖拽
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
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
        }
    }, [isDragging, dragStart, currentPointIndex]);

    // 上一個點
    const handlePrevPoint = () => {
        if (currentPointIndex > 0) {
            setDraggablePoint(currentPointIndex - 1);
        }
    };

    // 下一個點
    const handleNextPoint = () => {
        if (currentPointIndex < points.length - 1) {
            setDraggablePoint(currentPointIndex + 1);
        }
    };

    // 導航到拍照頁面
    const handleGoToPhotoCapture = () => {
        navigate('/manager/photo/capture');
    };

    // 計算功能
    const handleCalculate = () => {
        calculateSpecialLines();
        calculateAllDistancesAndAngles();
        setIsCalculated(true);
    };
    
    // 處理比例尺縮放因子改變
    const handleScaleFactorChange = (newScaleFactor) => {
        setScaleFactorState(newScaleFactor);
        // 如果已經計算過，則重新計算所有距離
        if (isCalculated) {
            calculateAllDistancesAndAngles(newScaleFactor);
        }
    };

    // 計算所有點之間的距離和角度
    // scaleFactor 參數為可選，如果沒有傳入則使用狀態中的值
    const calculateAllDistancesAndAngles = (scaleFactor) => {
        const currentScaleFactor = scaleFactor !== undefined ? scaleFactor : scaleFactorState;
        const results = [];
        
        // 計算所有點之間的距離
        results.push("=== 點之間的距離 ===");
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const distance = calculateDistance(points[i], points[j]);
                // 使用共用的格式化函數，根據是否為空白畫面模式選擇轉換方式
                const formattedDistance = formatDistanceWithMode(
                    distance,
                    showBlankScreen,  // 空白畫面模式使用螢幕實際 DPI 轉換
                    (px) => formatPxCmText(px, currentScaleFactor)  // 傳入縮放因子到格式化函數
                );
                results.push(`點${i + 1} 到 點${j + 1}: ${formattedDistance}`);
            }
        }
        
        results.push("");
        results.push("=== 點之間的角度 ===");
        
        // 計算角度（以每個點為頂點，計算與其相鄰點的夾角）
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
        
        // 將結果存儲到狀態中以便顯示
        setCalculationResults(results);
    };

    // 計算三點之間的角度
    const calculateAngleBetweenThreePoints = (pointA, vertex, pointC) => {
        const vectorAV = {
            x: pointA.x - vertex.x,
            y: pointA.y - vertex.y
        };
        
        const vectorCV = {
            x: pointC.x - vertex.x,
            y: pointC.y - vertex.y
        };
        
        const dotProduct = vectorAV.x * vectorCV.x + vectorAV.y * vectorCV.y;
        const magnitudeAV = Math.sqrt(vectorAV.x * vectorAV.x + vectorAV.y * vectorAV.y);
        const magnitudeCV = Math.sqrt(vectorCV.x * vectorCV.x + vectorCV.y * vectorCV.y);
        
        if (magnitudeAV === 0 || magnitudeCV === 0) {
            return 0;
        }
        
        const cosAngle = dotProduct / (magnitudeAV * magnitudeCV);
        const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle));
        const angleRadians = Math.acos(clampedCosAngle);
        const angleDegrees = angleRadians * 180 / Math.PI;
        
        return angleDegrees;
    };

    // 縮放功能
    const applyScale = (scale) => {
        const wrapper = neckContainerWrapperRef.current;
        if (wrapper) {
            wrapper.style.transform = `scale(${scale})`;
            wrapper.style.transformOrigin = 'center top';
            setCurrentScale(scale);
        }
    };

    const handleZoomIn = () => {
        const newScale = Math.min(currentScale + scaleStep, maxScale);
        applyScale(newScale);
    };

    const handleZoomOut = () => {
        const newScale = Math.max(currentScale - scaleStep, minScale);
        applyScale(newScale);
    };

    // 計算特殊線條和交點
    const calculateSpecialLines = () => {
        const newLines = [];
        const newIntersectionPoints = [];

        // 1. 畫點1與點4的連線
        const line14 = {
            id: 'line14',
            type: 'diagonal',
            start: points[0],
            end: points[3]
        };
        newLines.push(line14);

        // 2. 畫點3的水平線
        const horizontalLine = {
            id: 'horizontal3',
            type: 'horizontal',
            point: points[2]
        };
        newLines.push(horizontalLine);

        // 3. 畫點5的垂直線
        const verticalLine = {
            id: 'vertical5',
            type: 'vertical',
            point: points[4]
        };
        newLines.push(verticalLine);

        // 4. 計算水平線3與線14的交點（點6）
        const intersection6 = calculateLineIntersection(
            points[2], 'horizontal',
            points[0], points[3]
        );
        if (intersection6) {
            newIntersectionPoints.push({ id: '6', ...intersection6 });
        }

        // 5. 計算水平線3與垂直線5的交點（點7）
        const intersection7 = {
            x: points[4].x,
            y: points[2].y
        };
        newIntersectionPoints.push({ id: '7', ...intersection7 });

        // 6. 畫點5與點6的連線
        if (intersection6) {
            const line56 = {
                id: 'line56',
                type: 'diagonal',
                start: points[4],
                end: intersection6
            };
            newLines.push(line56);
        }

        setLines(newLines);
        setIntersectionPoints(newIntersectionPoints);
    };

    // 計算線段交點
    const calculateLineIntersection = (horizontalPoint, horizontalType, diagonalPoint1, diagonalPoint2) => {
        if (horizontalType === 'horizontal') {
            const y = horizontalPoint.y;
            const dx = diagonalPoint2.x - diagonalPoint1.x;
            const dy = diagonalPoint2.y - diagonalPoint1.y;
            
            if (dy === 0) return null;
            
            const t = (y - diagonalPoint1.y) / dy;
            
            if (t >= 0 && t <= 1) {
                const x = diagonalPoint1.x + t * dx;
                return { x, y };
            }
        }
        return null;
    };

    // 計算角度756
    const calculateAngle756 = (point7, point5, point6) => {
        const vector57 = {
            x: point7.x - point5.x,
            y: point7.y - point5.y
        };
        
        const vector56 = {
            x: point6.x - point5.x,
            y: point6.y - point5.y
        };
        
        const dotProduct = vector57.x * vector56.x + vector57.y * vector56.y;
        const magnitude57 = Math.sqrt(vector57.x * vector57.x + vector57.y * vector57.y);
        const magnitude56 = Math.sqrt(vector56.x * vector56.x + vector56.y * vector56.y);
        
        if (magnitude57 === 0 || magnitude56 === 0) {
            return 0;
        }
        
        const cosAngle = dotProduct / (magnitude57 * magnitude56);
        const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle));
        const angleRadians = Math.acos(clampedCosAngle);
        const angleDegrees = angleRadians * 180 / Math.PI;
        
        return angleDegrees;
    };

    // 計算兩點距離
    const calculateDistance = (point1, point2) => {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // 顯示保存選項對話框
    const handleSaveResult = () => {
        setShowSaveOptions(true);
    };

    // 處理綁定客戶
    const handleBindCustomer = async () => {
        try {
            // 取得客戶列表
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

    // 處理新建客戶
    const handleCreateNewCustomer = async () => {
        try {
            const userId = localStorage.getItem('userId') || 'default_user';
            
            // 將分析結果資料暫時保存到localStorage，不存入資料庫
            const pendingAnalysisData = {
                analysisType: 'spine',
                analysisData: {
                    scale: currentScale,
                    timestamp: new Date().toISOString()
                },
                points: points,
                lines: lines,
                intersectionPoints: intersectionPoints,
                calculationResults: calculationResults,
                backgroundImage: backgroundImage !== neckPatientImage ? backgroundImage : '',
                userId: userId,
                createdAt: new Date().toISOString()
            };
            
            // 將待綁定的分析結果存儲到localStorage
            localStorage.setItem('pendingAnalysisData', JSON.stringify(pendingAnalysisData));
            
            setShowSaveOptions(false);
            navigate('/manager/customer/add');
        } catch (error) {
            console.error('處理新建客戶錯誤:', error);
            alert('處理新建客戶失敗', error);
        }
    };

    // 選擇客戶並保存結果
    const handleSelectCustomer = async (customer) => {
        try {
            await saveAnalysisResult(customer.id);
            setShowCustomerModal(false);
            navigate('/manager/customer/edit/' + customer.id, { state: { customer } });
        } catch (error) {
            console.error('保存分析結果錯誤:', error);
            alert('保存分析結果失敗');
        }
    };

    // 保存分析結果到數據庫
    const saveAnalysisResult = async (customerId) => {
        try {
            const userId = localStorage.getItem('userId') || 'default_user';
            const analysisData = {
                customerId: customerId,
                userId: userId,
                analysisType: 'spine',
                analysisData: {
                    scale: currentScale,
                    timestamp: new Date().toISOString()
                },
                points: points,
                lines: lines,
                intersectionPoints: intersectionPoints,
                calculationResults: calculationResults,
                backgroundImage: backgroundImage !== neckPatientImage ? backgroundImage : ''
            };

            const response = await addCustomerAnalysisResult(analysisData);
            if (response.status === 200) {
                console.log('分析結果保存成功:', response.data);
                return response.data;
            }
        } catch (error) {
            console.error('保存分析結果錯誤:', error);
            throw error;
        }
    };

    // 關閉對話框
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
                backgroundPosition: 'center top',
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
        if(!showBlankScreen) {
            alert('切換為空白畫面模式，距離計算將依照螢幕實際尺寸(公分)進行。請受測者身體緊貼於螢幕，確保測量準確。');
        }
        setShowBlankScreen(!showBlankScreen);
    };

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
                        ref={neckContainerRef}
                        style={getContainerStyle()}
                    >
                        {/* 渲染點位 */}
                        {points.map((point, index) => (
                            <div
                                key={point.id}
                                className={`point ${point.isDraggable ? 'draggable' : ''}`}
                                style={{
                                    left: `${point.x}px`,
                                    top: `${point.y}px`
                                }}
                                onMouseDown={(e) => handleMouseDown(e, index)}
                                onTouchStart={(e) => handleMouseDown(e, index)}
                            >
                                {index + 1}
                            </div>
                        ))}

                        {/* 渲染線條 */}
                        {lines.map(line => {
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
                                        style={{
                                            left: '0px',
                                            top: `${line.point.y}px`,
                                            width: '100%'
                                        }}
                                    />
                                );
                            } else if (line.type === 'vertical') {
                                return (
                                    <div
                                        key={line.id}
                                        className="special-line vertical-line"
                                        style={{
                                            left: `${line.point.x}px`,
                                            top: '0px',
                                            height: '100%'
                                        }}
                                    />
                                );
                            }
                            return null;
                        })}

                        {/* 渲染交點 */}
                        {intersectionPoints.map(point => (
                            <div
                                key={point.id}
                                className="intersection-point"
                                style={{
                                    left: `${point.x}px`,
                                    top: `${point.y}px`
                                }}
                            >
                                {point.id}
                            </div>
                        ))}

                        {!showBlankScreen && (
                            <ScaleIndicator 
                                scaleFactor={scaleFactorState}
                                onScaleFactorChange={handleScaleFactorChange}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* 縮放控制按鈕（點位切換已改為直接點擊點位標記） */}
            <div className="menu-bottom-second">
                <button 
                    onClick={handleZoomIn}
                    disabled={currentScale >= maxScale}
                >
                    +
                </button>
                <button 
                    onClick={handleZoomOut}
                    disabled={currentScale <= minScale}
                >
                    -
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

            {/* 保存選項對話框 */}
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

            {/* 客戶選擇對話框 */}
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

export default AnalysisSpine;
/**
 * CameraPointDrag.jsx - 攝影點位拖曳功能頁面
 * 
 * 功能說明：
 * - 結合攝影機即時串流與點位拖曳功能
 * - 使用者可在即時影像上調整分析點位
 * - 調整完成後拍照並導向對應分析頁面
 * 
 * 技術特點：
 * - 即時影像串流 (getUserMedia API)
 * - 點位拖曳功能
 * - 點位資料傳遞至分析頁面
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCamera, FaTimes } from 'react-icons/fa';
import ScaleIndicator from '../../components.spine/ScaleIndicator';

const MAX_IMAGE_DIMENSION = 1600;
const MAX_IMAGE_BYTES = 900 * 1024;
const DEFAULT_JPEG_QUALITY = 0.85;
const MIN_JPEG_QUALITY = 0.5;

const getBase64SizeInBytes = (dataUrl) => {
    if (!dataUrl) return 0;
    const base64 = dataUrl.split(',')[1];
    if (!base64) return 0;
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return Math.ceil((base64.length * 3) / 4) - padding;
};

function CameraPointDrag() {
    const navigate = useNavigate();
    const location = useLocation();
    const analysisType = location.state?.analysisType || 'spine'; // 'spine' 或 'tail'
    
    // 視頻串流相關
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    
    // 狀態管理
    const [isStreamReady, setIsStreamReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    
    // 點位相關狀態
    const [points, setPoints] = useState([]);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // 根據分析類型設定初始點位
    const getInitialPointPositions = () => {
        if (analysisType === 'tail') {
            // 尾椎：3個點
            return [
                { x: 0.42, y: 0.50 },
                { x: 0.34, y: 0.70 },
                { x: 0.34, y: 0.50 }
            ];
        } else {
            // 頸部：5個點
            return [
                { x: 0.3, y: 0.1 },
                { x: 0.35, y: 0.2 },
                { x: 0.37, y: 0.3 },
                { x: 0.3, y: 0.41 },
                { x: 0.24, y: 0.52 }
            ];
        }
    };
    
    // 初始化點位
    const initPoints = useCallback(() => {
        if (containerSize.width === 0 || containerSize.height === 0) return;
        
        const initialPositions = getInitialPointPositions();
        const newPoints = initialPositions.map((pos, index) => ({
            id: index,
            x: pos.x * containerSize.width,
            y: pos.y * containerSize.height,
            isDraggable: index === 0
        }));
        
        setPoints(newPoints);
        setCurrentPointIndex(0);
    }, [containerSize, analysisType]);
    
    // 啟動攝影機
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsStreamReady(true);
            }
        } catch (error) {
            console.error('無法啟動攝影機:', error);
            alert('無法啟動攝影機，請確認已授予相機權限');
        }
    }, []);
    
    // 停止攝影機
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsStreamReady(false);
    }, []);
    
    // 組件掛載時啟動攝影機
    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, [startCamera, stopCamera]);
    
    // 監聽容器尺寸變化
    useEffect(() => {
        const updateContainerSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({
                    width: rect.width,
                    height: rect.height
                });
            }
        };
        
        updateContainerSize();
        window.addEventListener('resize', updateContainerSize);
        
        return () => {
            window.removeEventListener('resize', updateContainerSize);
        };
    }, []);
    
    // 初始化點位（當容器尺寸確定後）
    useEffect(() => {
        if (containerSize.width > 0 && containerSize.height > 0 && points.length === 0) {
            initPoints();
        }
    }, [containerSize, points.length, initPoints]);
    
    // 點位拖曳處理
    const handleMouseDown = (e, pointIndex) => {
        if (points[pointIndex] && !points[pointIndex].isDraggable) return;
        
        e.preventDefault();
        setIsDragging(true);
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        
        setDragStart({
            x: clientX - rect.left - points[pointIndex].x,
            y: clientY - rect.top - points[pointIndex].y
        });
    };
    
    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !containerRef.current) return;
        
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        
        let newX = clientX - rect.left - dragStart.x;
        let newY = clientY - rect.top - dragStart.y;
        
        // 限制點在容器範圍內
        newX = Math.max(0, Math.min(containerSize.width - 10, newX));
        newY = Math.max(0, Math.min(containerSize.height - 10, newY));
        
        setPoints(prevPoints =>
            prevPoints.map((point, index) =>
                index === currentPointIndex ? { ...point, x: newX, y: newY } : point
            )
        );
    }, [isDragging, dragStart, currentPointIndex, containerSize]);
    
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);
    
    useEffect(() => {
        if (isDragging) {
            const handleMove = (e) => handleMouseMove(e);
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
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);
    
    // 設置當前可拖曳的點
    const setDraggablePoint = (index) => {
        setPoints(prevPoints =>
            prevPoints.map((point, i) => ({
                ...point,
                isDraggable: i === index
            }))
        );
        setCurrentPointIndex(index);
    };
    
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
    
    // 圖片優化
    const optimizeImageData = useCallback((dataUrl) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
                    if (width > height) {
                        height = (height / width) * MAX_IMAGE_DIMENSION;
                        width = MAX_IMAGE_DIMENSION;
                    } else {
                        width = (width / height) * MAX_IMAGE_DIMENSION;
                        height = MAX_IMAGE_DIMENSION;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                let quality = DEFAULT_JPEG_QUALITY;
                let optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
                
                while (getBase64SizeInBytes(optimizedDataUrl) > MAX_IMAGE_BYTES && quality > MIN_JPEG_QUALITY) {
                    quality -= 0.05;
                    optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
                }
                
                resolve(optimizedDataUrl);
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    }, []);
    
    // 拍攝照片
    const handleCapturePhoto = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) {
            alert('攝影機尚未準備完成，請稍後再試');
            return;
        }
        
        setIsProcessing(true);
        
        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                alert('畫布初始化失敗');
                return;
            }
            
            // 設置畫布尺寸為視頻尺寸
            canvas.width = videoRef.current.videoWidth || MAX_IMAGE_DIMENSION;
            canvas.height = videoRef.current.videoHeight || MAX_IMAGE_DIMENSION;
            
            // 繪製當前影像
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            // 取得圖片資料
            const dataUrl = canvas.toDataURL('image/png');
            const optimizedDataUrl = await optimizeImageData(dataUrl);
            
            // 計算點位相對比例（相對於容器）
            const relativePoints = points.map(point => ({
                x: point.x / containerSize.width,
                y: point.y / containerSize.height
            }));
            
            // 儲存照片和點位資料
            localStorage.setItem('spineAnalysisPhoto', optimizedDataUrl);
            localStorage.setItem('spineAnalysisPhotoTimestamp', Date.now().toString());
            localStorage.setItem('spineAnalysisPoints', JSON.stringify(relativePoints));
            
            // 停止攝影機
            stopCamera();
            
            // 導向分析頁面
            const targetPath = analysisType === 'tail' 
                ? '/manager/analysis/tail' 
                : '/manager/analysis/spine';
            navigate(targetPath);
            
        } catch (error) {
            console.error('拍照失敗:', error);
            alert('拍照失敗，請重試');
        } finally {
            setIsProcessing(false);
        }
    }, [points, containerSize, analysisType, optimizeImageData, stopCamera, navigate]);
    
    // 取消並返回
    const handleCancel = () => {
        stopCamera();
        navigate('/manager/photo/capture');
    };
    
    return (
        <div className="camera-point-drag">
            <div className="photo-camera-overlay" role="dialog" aria-modal="true">
                <div className="photo-camera-overlay__frame">
                    <div 
                        ref={containerRef}
                        className="camera-point-drag__container"
                        style={{ position: 'relative', width: '100%', height: '100%' }}
                    >
                        <video
                            ref={videoRef}
                            className="photo-camera-overlay__video"
                            playsInline
                            autoPlay
                            muted
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        
                        {/* 點位顯示 */}
                        {points.map((point, index) => (
                            <div
                                key={point.id}
                                className={`point ${point.isDraggable ? 'draggable' : ''}`}
                                style={{
                                    position: 'absolute',
                                    left: `${point.x}px`,
                                    top: `${point.y}px`,
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    backgroundColor: point.isDraggable ? '#00ff00' : '#ff0000',
                                    border: '2px solid white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    cursor: point.isDraggable ? 'move' : 'default',
                                    userSelect: 'none',
                                    zIndex: 10,
                                    transform: 'translate(-50%, -50%)',
                                    touchAction: 'none'
                                }}
                                onMouseDown={(e) => handleMouseDown(e, index)}
                                onTouchStart={(e) => handleMouseDown(e, index)}
                            >
                                {index + 1}
                            </div>
                        ))}
                        
                        <ScaleIndicator className="scale-indicator--camera" />
                    </div>
                    
                    {/* 點位切換控制 */}
                    <div className="camera-point-drag__point-controls">
                        <button 
                            onClick={handlePrevPoint}
                            disabled={currentPointIndex === 0}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                backgroundColor: currentPointIndex === 0 ? '#ccc' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: currentPointIndex === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            &lt; 上一點
                        </button>
                        <span style={{ color: 'white', fontSize: '16px', margin: '0 15px' }}>
                            點位 {currentPointIndex + 1} / {points.length}
                        </span>
                        <button 
                            onClick={handleNextPoint}
                            disabled={currentPointIndex === points.length - 1}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                backgroundColor: currentPointIndex === points.length - 1 ? '#ccc' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: currentPointIndex === points.length - 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            下一點 &gt;
                        </button>
                    </div>
                    
                    {/* 底部控制按鈕 */}
                    <div className="photo-camera-overlay__controls">
                        <button 
                            onClick={handleCapturePhoto}
                            disabled={isProcessing}
                            style={{
                                padding: '12px 30px',
                                fontSize: '18px',
                                backgroundColor: isProcessing ? '#ccc' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaCamera />
                            {isProcessing ? '處理中...' : '拍攝照片'}
                        </button>
                        <button 
                            onClick={handleCancel}
                            disabled={isProcessing}
                            style={{
                                padding: '12px 30px',
                                fontSize: '18px',
                                backgroundColor: isProcessing ? '#ccc' : '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaTimes />
                            取消
                        </button>
                    </div>
                </div>
            </div>
            
            {/* 隱藏的畫布 */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {/* 載入提示 */}
            {isProcessing && (
                <div className="photo-processing-overlay">
                    <div className="photo-processing-message">處理中...</div>
                </div>
            )}
        </div>
    );
}

export default CameraPointDrag;

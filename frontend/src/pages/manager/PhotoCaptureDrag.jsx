/**
 * PhotoCaptureDrag.jsx - 攝影點位拖曳頁面
 * 
 * 功能說明：
 * - 直接開啟相機進行拍攝
 * - 拍攝後立即進入點位拖曳模式
 * - 支援頸部分析或尾椎分析模式
 * - 整合拍照功能與點位拖曳功能
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AnalysisSpine.css';
import neckPatientImage from '../../assets/images/病患側面.png';
import { addCustomerAnalysisResult } from '../../api/manager/customerAnalysisResult';
import { getCustomerList } from '../../api/manager/customer';
import ScaleIndicator from '../../components/ScaleIndicator';
import { formatPxCmText, convertPxToCm } from '../../utils/scaleConversion';

const MAX_IMAGE_DIMENSION = 1600;
const MIN_IMAGE_DIMENSION = 800;
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

function PhotoCaptureDrag() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 從 URL 參數獲取分析類型
    const searchParams = new URLSearchParams(location.search);
    const analysisType = searchParams.get('type') || 'spine'; // 'spine' 或 'tail'
    
    // === 視圖狀態 ===
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCameraOverlay, setShowCameraOverlay] = useState(true);
    
    // === 相機容器引用 ===
    const cameraContainerRef = useRef(null);
    
    // 根據分析類型設置初始點位
    const getInitialPoints = () => {
        if (analysisType === 'tail') {
            // 尾椎分析：三個點
            return [
                { x: 0.42, y: 0.50 },
                { x: 0.34, y: 0.70 },
                { x: 0.34, y: 0.50 }
            ];
        } else {
            // 頸部分析：五個點
            return [
                { x: 0.3, y: 0.1 },
                { x: 0.35, y: 0.2 },
                { x: 0.37, y: 0.3 },
                { x: 0.3, y: 0.41 },
                { x: 0.24, y: 0.52 }
            ];
        }
    };
    
    const [points, setPoints] = useState([]);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // === 保存結果相關 ===
    const [capturedImage, setCapturedImage] = useState(null);
    
    // === DOM 引用 ===
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);
    
    // === 初始化相機 ===
    const stopCameraStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);
    
    useEffect(() => {
        return () => {
            stopCameraStream();
        };
    }, [stopCameraStream]);
    
    useEffect(() => {
        if (!showCameraOverlay) {
            return () => undefined;
        }

        let isCancelled = false;

        const startCamera = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('您的瀏覽器不支持攝像頭功能，請使用較新版本的瀏覽器');
                setShowCameraOverlay(false);
                navigate('/manager/photo/capture');
                return;
            }

            setIsProcessing(true);
            try {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const constraints = {
                    video: {
                        facingMode: isMobile ? { ideal: 'environment' } : 'user'
                    }
                };
                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

                if (isCancelled) {
                    mediaStream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = mediaStream;

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    try {
                        await videoRef.current.play();
                    } catch (playError) {
                        console.warn('無法自動播放攝像頭影像:', playError);
                    }
                }
            } catch (error) {
                console.error('攝像頭訪問錯誤:', error);
                const errorMessage = error?.name === 'NotAllowedError'
                    ? '攝像頭權限被拒絕，請在瀏覽器設定中允許攝像頭權限'
                    : error?.name === 'NotFoundError'
                        ? '未檢測到攝像頭設備，請確認設備已正確連接'
                        : `無法訪問攝像頭: ${error?.message || '未知錯誤'}`;
                alert(errorMessage);
                setShowCameraOverlay(false);
                navigate('/manager/photo/capture');
            } finally {
                if (!isCancelled) {
                    setIsProcessing(false);
                }
            }
        };

        startCamera();

        return () => {
            isCancelled = true;
            stopCameraStream();
        };
    }, [showCameraOverlay, stopCameraStream, navigate]);
    
    // === 圖片優化 ===
    const optimizeImageData = useCallback((dataUrl) => {
        return new Promise((resolve, reject) => {
            if (!dataUrl) {
                reject(new Error('圖片資料不存在'));
                return;
            }

            const img = new Image();
            img.onload = () => {
                let targetWidth = img.width;
                let targetHeight = img.height;
                const longestSide = Math.max(targetWidth, targetHeight);

                if (longestSide > MAX_IMAGE_DIMENSION) {
                    const scale = MAX_IMAGE_DIMENSION / longestSide;
                    targetWidth = Math.round(targetWidth * scale);
                    targetHeight = Math.round(targetHeight * scale);
                }

                const canvas = document.createElement('canvas');
                const redraw = () => {
                    canvas.width = Math.max(1, Math.round(targetWidth));
                    canvas.height = Math.max(1, Math.round(targetHeight));
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };

                redraw();

                let quality = DEFAULT_JPEG_QUALITY;
                let optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
                let attempts = 0;

                while (
                    getBase64SizeInBytes(optimizedDataUrl) > MAX_IMAGE_BYTES &&
                    attempts < 12
                ) {
                    if (quality > MIN_JPEG_QUALITY) {
                        quality = Math.max(
                            MIN_JPEG_QUALITY,
                            parseFloat((quality - 0.1).toFixed(2))
                        );
                    } else if (Math.max(targetWidth, targetHeight) > MIN_IMAGE_DIMENSION) {
                        targetWidth = Math.round(targetWidth * 0.85);
                        targetHeight = Math.round(targetHeight * 0.85);
                        redraw();
                    } else {
                        break;
                    }

                    optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    attempts += 1;
                }

                // 返回優化後的圖片數據和實際尺寸
                resolve({
                    dataUrl: optimizedDataUrl,
                    width: canvas.width,
                    height: canvas.height
                });
            };

            img.onerror = () => {
                reject(new Error('圖片載入失敗'));
            };

            img.src = dataUrl;
        });
    }, []);
    
    const handleCloseCameraOverlay = useCallback(() => {
        setShowCameraOverlay(false);
        stopCameraStream();
        navigate('/manager/photo/capture');
    }, [stopCameraStream, navigate]);
    
    // === 初始化點位 ===
    const initPoints = useCallback(() => {
        const container = cameraContainerRef.current;
        if (!container) return;

        const initialPointPositions = getInitialPoints();
        const newPoints = initialPointPositions.map((pos, index) => ({
            id: index,
            x: pos.x * container.offsetWidth,
            y: pos.y * container.offsetHeight,
            isDraggable: index === 0
        }));
        
        setPoints(newPoints);
        setCurrentPointIndex(0);
    }, [analysisType]);
    
    // 當相機容器準備好時初始化點位
    useEffect(() => {
        if (showCameraOverlay && cameraContainerRef.current && videoRef.current && videoRef.current.readyState >= 2) {
            // 等待視頻元數據加載完成
            initPoints();
        }
    }, [showCameraOverlay, initPoints]);
    
    // 監聽視頻加載完成事件
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleLoadedMetadata = () => {
                initPoints();
            };
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [initPoints]);
    
    // === 點位拖曳功能 ===
    const setDraggablePoint = (index) => {
        setPoints(prevPoints => 
            prevPoints.map((point, i) => ({
                ...point,
                isDraggable: i === index
            }))
        );
        setCurrentPointIndex(index);
    };
    
    const handleMouseDown = (e, pointIndex) => {
        if (points[pointIndex] && !points[pointIndex].isDraggable) return;
        
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const container = cameraContainerRef.current;
        const rect = container.getBoundingClientRect();
        
        setDragStart({
            x: clientX - rect.left - points[pointIndex].x,
            y: clientY - rect.top - points[pointIndex].y
        });
    };
    
    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const container = cameraContainerRef.current;
        if (!container) return;
        
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
    }, [isDragging, dragStart, currentPointIndex]);
    
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);
    
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
    
    // === 拍照處理 ===
    const handleCaptureFromStream = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) {
            alert('攝像頭尚未準備完成，請稍後再試');
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            alert('畫布初始化失敗，請刷新頁面後再試');
            return;
        }

        setIsProcessing(true);
        try {
            // 獲取視頻的實際尺寸
            const videoWidth = videoRef.current.videoWidth || MAX_IMAGE_DIMENSION;
            const videoHeight = videoRef.current.videoHeight || MAX_IMAGE_DIMENSION;
            
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            const optimizedResult = await optimizeImageData(dataUrl);
            
            // 使用優化後的圖片數據和尺寸
            const optimizedDataUrl = optimizedResult.dataUrl;
            const finalImageWidth = optimizedResult.width;
            const finalImageHeight = optimizedResult.height;
            
            // 保存拍攝的照片
            setCapturedImage(optimizedDataUrl);
            
            // 計算點位相對於容器的比例位置
            const container = cameraContainerRef.current;
            if (!container) {
                throw new Error('相機容器未找到');
            }
            
            // 獲取容器的顯示尺寸
            const containerRect = container.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const containerHeight = containerRect.height;
            
            // 計算視頻在容器中的實際顯示尺寸（考慮 object-fit: contain）
            // 注意：這裡仍使用視頻尺寸計算，因為點位是在視頻流上標記的
            const videoAspect = videoWidth / videoHeight;
            const containerAspect = containerWidth / containerHeight;
            
            let displayWidth, displayHeight, offsetX, offsetY;
            
            if (containerAspect > videoAspect) {
                // 容器更寬，視頻以高度為準
                displayHeight = containerHeight;
                displayWidth = displayHeight * videoAspect;
                offsetX = (containerWidth - displayWidth) / 2;
                offsetY = 0;
            } else {
                // 容器更高，視頻以寬度為準
                displayWidth = containerWidth;
                displayHeight = displayWidth / videoAspect;
                offsetX = 0;
                offsetY = (containerHeight - displayHeight) / 2;
            }
            
            // 將點位從容器坐標轉換為視頻內部的相對位置（0-1 範圍）
            const relativePoints = points.map(point => {
                // 減去偏移量，得到視頻內的坐標
                const videoX = point.x - offsetX;
                const videoY = point.y - offsetY;
                
                // 轉換為 0-1 範圍的相對位置
                return {
                    x: Math.max(0, Math.min(1, videoX / displayWidth)),
                    y: Math.max(0, Math.min(1, videoY / displayHeight)),
                    id: point.id
                };
            });
            
            stopCameraStream();
            
            // 使用 React Router state 直接传递数据到分析页面
            // 重要：使用優化後的實際圖片尺寸，而非原始視頻尺寸
            const analysisData = {
                photo: optimizedDataUrl,
                points: relativePoints,
                imageSize: {
                    width: finalImageWidth,
                    height: finalImageHeight
                },
                timestamp: Date.now()
            };
            
            // 导向对应的分析页面，通过 state 传递数据
            const targetPath = analysisType === 'tail' ? '/manager/analysis/tail' : '/manager/analysis/spine';
            navigate(targetPath, { state: analysisData });
        } catch (error) {
            console.error('拍照失敗:', error);
            alert('拍照失敗，請重試');
        } finally {
            setIsProcessing(false);
        }
    }, [points, analysisType, stopCameraStream, optimizeImageData, navigate]);

    // === 渲染 ===
    return (
        <div className="analysis-spine">
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {isProcessing && (
                <div className="photo-processing-overlay">
                    <div className="photo-processing-message">處理中...</div>
                </div>
            )}
            
            {/* 相機覆蓋層 - 帶點位拖曳功能 */}
            {showCameraOverlay && (
                <div className="photo-camera-overlay" role="dialog" aria-modal="true">
                    <div className="photo-camera-overlay__frame" ref={cameraContainerRef}>
                        <video
                            ref={videoRef}
                            className="photo-camera-overlay__video"
                            playsInline
                            autoPlay
                            muted
                        />
                        
                        {/* 在視頻流上顯示可拖曳點位 */}
                        {points.length > 0 && points.map((point, index) => (
                            <div
                                key={point.id}
                                className={`point ${point.isDraggable ? 'draggable' : ''}`}
                                style={{
                                    position: 'absolute',
                                    left: `${point.x}px`,
                                    top: `${point.y}px`,
                                    zIndex: 10
                                }}
                                onMouseDown={(e) => handleMouseDown(e, index)}
                                onTouchStart={(e) => handleMouseDown(e, index)}
                            >
                                {index + 1}
                            </div>
                        ))}
                        
                        <ScaleIndicator className="scale-indicator--camera" />
                        
                        {/* 拍照控制區域 */}
                        <div className="photo-camera-overlay__bottom-controls">
                            {/* 點位控制 */}
                            <div className="photo-camera-overlay__point-controls">
                                <button 
                                    onClick={handlePrevPoint} 
                                    disabled={currentPointIndex === 0}
                                    className="point-nav-btn"
                                >
                                    上一個點
                                </button>
                                <span className="current-point-info">
                                    點 {currentPointIndex + 1} / {points.length}
                                </span>
                                <button 
                                    onClick={handleNextPoint} 
                                    disabled={currentPointIndex === points.length - 1}
                                    className="point-nav-btn"
                                >
                                    下一個點
                                </button>
                            </div>
                            
                            {/* 拍照控制 */}
                            <div className="photo-camera-overlay__controls">
                                <button onClick={handleCaptureFromStream} className="capture-btn">
                                    拍照
                                </button>
                                <button onClick={handleCloseCameraOverlay} className="cancel-btn">
                                    取消
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PhotoCaptureDrag;
/**
 * PhotoCapture.jsx - 拍照上傳功能頁面
 * 
 * 功能說明：
 * - 支援移動設備相機拍攝 (HTML5 File Input API)
 * - 支援桌面設備網路攝像頭拍攝 (getUserMedia API)
 * - 提供照片編輯功能 (裁切)
 * - 響應式設計，適配不同設備
 * 
 * 技術特點：
 * - 自動檢測設備類型並使用相應的拍照方式
 * - React Hooks 狀態管理
 * - Canvas API 處理圖片裁切
 * - 完整的錯誤處理與權限提示
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PhotoCapture.css';
import { FaCamera, FaUpload, FaCrop, FaSave, FaPlus, FaTimes, FaRedo } from 'react-icons/fa';
import ScaleIndicator from '../../components/ScaleIndicator';

const MAX_IMAGE_DIMENSION = 1600;
const MIN_IMAGE_DIMENSION = 800;
const MAX_IMAGE_BYTES = 900 * 1024; // Firestore 單筆文件上限 1MB，留些餘裕
const DEFAULT_JPEG_QUALITY = 0.85;
const MIN_JPEG_QUALITY = 0.5;

const getBase64SizeInBytes = (dataUrl) => {
    if (!dataUrl) return 0;
    const base64 = dataUrl.split(',')[1];
    if (!base64) return 0;
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return Math.ceil((base64.length * 3) / 4) - padding;
};

function PhotoCapture() {
    // === 路由導航 ===
    const navigate = useNavigate();

    // === 狀態管理 ===
    const [currentView, setCurrentView] = useState('main'); // 'main', 'preview', 'editor', 'result'
    const [imageData, setImageData] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [deviceInfo, setDeviceInfo] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [showCameraOverlay, setShowCameraOverlay] = useState(false);
    
    // === 編輯相關狀態 ===
    const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 300, height: 300 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // === DOM 引用 ===
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const previewImageRef = useRef(null);
    const editorImageRef = useRef(null);
    const canvasRef = useRef(null);
    const cropAreaRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // === 設備檢測 ===
    const detectDevice = useCallback(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const info = isMobile ? 
            "檢測到移動設備，可以使用相機拍攝或從相冊選擇照片" : 
            "檢測到桌面設備，可以使用網絡攝像頭或上傳照片";
        setDeviceInfo(info);
        setIsMobileDevice(isMobile);
        return isMobile;
    }, []);

    // === 初始化 ===
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
        detectDevice();
        return () => {
            stopCameraStream();
        };
    }, [detectDevice, stopCameraStream]);

    useEffect(() => {
        if (!showCameraOverlay) {
            return () => undefined;
        }

        let isCancelled = false;

        const startCamera = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setShowCameraOverlay(false);
                if (cameraInputRef.current) {
                    cameraInputRef.current.click();
                } else {
                    alert('您的瀏覽器不支持攝像頭功能，請使用較新版本的瀏覽器');
                }
                return;
            }

            setIsProcessing(true);
            try {
                const constraints = {
                    video: {
                        facingMode: isMobileDevice ? { ideal: 'environment' } : 'user'
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
    }, [showCameraOverlay, isMobileDevice, stopCameraStream]);

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

                resolve(optimizedDataUrl);
            };

            img.onerror = () => reject(new Error('圖片載入失敗'));
            img.src = dataUrl;
        });
    }, []);

    const updatePreviewFromDataUrl = useCallback(async (dataUrl) => {
        try {
            const optimizedDataUrl = await optimizeImageData(dataUrl);
            setPreviewUrl(optimizedDataUrl);
            setImageData(optimizedDataUrl);
            setCurrentView('preview');
        } catch (error) {
            console.error('圖片處理失敗:', error);
            alert('圖片處理失敗，請重試');
        } finally {
            setIsProcessing(false);
        }
    }, [optimizeImageData]);

    // === 處理文件選擇 ===
    const handleFileSelect = useCallback((file) => {
        if (!file) return;

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const url = e.target?.result;
            if (!url) {
                alert('讀取文件時發生錯誤，請重新選擇文件');
                setIsProcessing(false);
                return;
            }
            await updatePreviewFromDataUrl(url);
        };

        reader.onerror = () => {
            alert('讀取文件時發生錯誤，請重新選擇文件');
            setIsProcessing(false);
        };

        reader.readAsDataURL(file);
    }, [updatePreviewFromDataUrl]);

    // === 拍攝照片處理 ===
    const handleCameraCapture = useCallback(() => {
        const cameraSupported = typeof navigator !== 'undefined'
            && navigator.mediaDevices
            && navigator.mediaDevices.getUserMedia;

        if (!cameraSupported) {
            if (cameraInputRef.current) {
                cameraInputRef.current.click();
            } else {
                alert('您的瀏覽器不支持攝像頭功能，請使用較新版本的瀏覽器');
            }
            return;
        }

        setShowCameraOverlay(true);
    }, []);

    // === 上傳照片 ===
    const handleFileUpload = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    // === 編輯照片 ===
    const handleEditPhoto = useCallback(() => {
        if (!previewImageRef.current) return;
        
        setCurrentView('editor');
        
        // 等待圖片加載完成後初始化裁切區域
        setTimeout(() => {
            if (editorImageRef.current) {
                const img = editorImageRef.current;
                const width = Math.min(img.offsetWidth, 300);
                const height = Math.min(img.offsetHeight, 300);
                const x = (img.offsetWidth - width) / 2;
                const y = (img.offsetHeight - height) / 2;
                
                setCropArea({ x, y, width, height });
            }
        }, 100);
    }, []);

    // === 保存照片 ===
    const handleSavePhoto = useCallback(() => {
        setCurrentView('result');
    }, []);

    // === 執行裁切 ===
    const handleCropPhoto = useCallback(async () => {
        if (!editorImageRef.current || !canvasRef.current) return;

        setIsProcessing(true);
        const img = editorImageRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            setIsProcessing(false);
            alert('畫布初始化失敗，請重新嘗試');
            return;
        }

        // 設置畫布尺寸
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        // 繪製裁切後的圖片
        ctx.drawImage(
            img,
            cropArea.x, cropArea.y, cropArea.width, cropArea.height,
            0, 0, cropArea.width, cropArea.height
        );

        // 獲取裁切後的圖片數據
        const croppedDataUrl = canvas.toDataURL('image/png');
        await updatePreviewFromDataUrl(croppedDataUrl);
    }, [cropArea, updatePreviewFromDataUrl]);

    // === 取消編輯 ===
    const handleCancelEdit = useCallback(() => {
        setCurrentView('preview');
    }, []);

    // === 重新開始 ===
    const handleNewPhoto = useCallback(() => {
        setCurrentView('main');
        setPreviewUrl(null);
        setImageData(null);
        setCropArea({ x: 0, y: 0, width: 300, height: 300 });
        setShowAnalysisModal(false);
        setShowCameraOverlay(false);
        stopCameraStream();
        
        // 清理文件輸入
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    }, [stopCameraStream]);

    // === 切換到分析頁面並傳遞照片 ===
    const handleOpenAnalysisChoice = useCallback(() => {
        if (!imageData) {
            alert('請先拍攝或選擇一張照片');
            return;
        }
        setShowAnalysisModal(true);
    }, [imageData]);

    const handleSelectAnalysis = useCallback((target) => {
        if (!imageData) {
            alert('請先拍攝或選擇一張照片');
            setShowAnalysisModal(false);
            return;
        }

        localStorage.setItem('spineAnalysisPhoto', imageData);
        localStorage.setItem('spineAnalysisPhotoTimestamp', Date.now().toString());

        const targetPath = target === 'tail' ? '/manager/analysis/tail' : '/manager/analysis/spine';
        navigate(targetPath);
        setShowAnalysisModal(false);
    }, [imageData, navigate]);

    const handleCloseAnalysisChoice = useCallback(() => {
        setShowAnalysisModal(false);
    }, []);

    // === 裁切區域拖拽處理 ===
    const handleCropMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
        
        const rect = cropAreaRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        setDragStart({
            x: clientX - rect.left,
            y: clientY - rect.top
        });
    }, []);

    const handleCropMouseMove = useCallback((e) => {
        if (!isDragging || !editorImageRef.current) return;
        
        e.preventDefault();
        const img = editorImageRef.current;
        const imgRect = img.getBoundingClientRect();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const newX = Math.max(0, Math.min(
            img.offsetWidth - cropArea.width,
            clientX - imgRect.left - dragStart.x
        ));
        const newY = Math.max(0, Math.min(
            img.offsetHeight - cropArea.height,
            clientY - imgRect.top - dragStart.y
        ));
        
        setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    }, [isDragging, dragStart, cropArea.width, cropArea.height]);

    const handleCropMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

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
            canvas.width = videoRef.current.videoWidth || MAX_IMAGE_DIMENSION;
            canvas.height = videoRef.current.videoHeight || MAX_IMAGE_DIMENSION;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            await updatePreviewFromDataUrl(dataUrl);
            setShowCameraOverlay(false);
            stopCameraStream();
        } catch (error) {
            console.error('拍照失敗:', error);
            alert('拍照失敗，請重試');
        } finally {
            setIsProcessing(false);
        }
    }, [stopCameraStream, updatePreviewFromDataUrl]);

    const handleCloseCameraOverlay = useCallback(() => {
        setShowCameraOverlay(false);
        stopCameraStream();
    }, [stopCameraStream]);

    // === 添加拖拽事件監聽 ===
    useEffect(() => {
        if (isDragging) {
            const handleMove = (e) => handleCropMouseMove(e);
            const handleUp = () => handleCropMouseUp();
            
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
    }, [isDragging, handleCropMouseMove, handleCropMouseUp]);

    // === 渲染主界面 ===
    const renderMainView = () => (
        <div className="photo-capture-content">
            <div className="photo-capture-card">
                <h2 className="photo-capture-title">照片拍攝與上傳</h2>
                <p className="photo-capture-description">
                    使用設備相機拍攝照片或從相冊上傳照片，支援簡單的編輯功能
                </p>
                
                <button onClick={handleCameraCapture} >
                    <FaCamera />
                    <span>拍攝照片</span>
                </button>
                <br />
                <br />
                <button onClick={handleFileUpload} >
                    <FaUpload />
                    <span>上傳照片</span>
                </button>
                
                <div className="device-info-display">
                    {deviceInfo}
                </div>
            </div>
        </div>
    );

    // === 渲染預覽界面 ===
    const renderPreviewView = () => (
        <div className="photo-capture-content">
            <div className="photo-capture-card">
                <h2 className="photo-capture-title">照片預覽</h2>
                <div className="photo-preview-container">
                    <img 
                        ref={previewImageRef}
                        src={previewUrl} 
                        alt="照片預覽" 
                        className="photo-preview-image"
                    />
                    <ScaleIndicator className="scale-indicator--capture" />
                </div>
            </div>
        </div>
    );

    // === 渲染編輯界面 ===
    const renderEditorView = () => (
        <div className="photo-capture-content">
            <div className="photo-capture-card">
                <h2 className="photo-capture-title">編輯照片</h2>
                <div className="photo-editor-container">
                    <div className="photo-crop-container">
                        <img 
                            ref={editorImageRef}
                            src={previewUrl} 
                            alt="編輯照片" 
                            className="photo-editor-image"
                        />
                        <div 
                            ref={cropAreaRef}
                            className="photo-crop-area"
                            style={{
                                left: `${cropArea.x}px`,
                                top: `${cropArea.y}px`,
                                width: `${cropArea.width}px`,
                                height: `${cropArea.height}px`
                            }}
                            onMouseDown={handleCropMouseDown}
                            onTouchStart={handleCropMouseDown}
                        />
                        <ScaleIndicator className="scale-indicator--capture" />
                    </div>
                </div>
            </div>
        </div>
    );

    // === 渲染結果界面 ===
    const renderResultView = () => (
        <div className="photo-capture-content">
            <div className="photo-capture-card">
                <h2 className="photo-capture-title">最終結果</h2>
                <div className="photo-result-container">
                    <img 
                        src={previewUrl} 
                        alt="最終結果" 
                        className="photo-result-image"
                    />
                    <ScaleIndicator className="scale-indicator--capture" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="photo-capture">
            {/* 隱藏的文件輸入 */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="camera"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            
            {/* 隱藏的畫布 */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {/* 載入提示 */}
            {isProcessing && (
                <div className="photo-processing-overlay">
                    <div className="photo-processing-message">處理中...</div>
                </div>
            )}
            
            {/* 根據當前視圖渲染對應界面 */}
            {currentView === 'main' && renderMainView()}
            {currentView === 'preview' && renderPreviewView()}
            {currentView === 'editor' && renderEditorView()}
            {currentView === 'result' && renderResultView()}

            {/* 底部控制按鈕 */}
            {currentView === 'preview' && (
                <div className="photo-bottom-menu">
                    <button onClick={handleOpenAnalysisChoice}>
                        <FaPlus />
                        <span>開始分析</span>
                    </button>
                    <button onClick={handleEditPhoto}>
                        <FaCrop />
                        <span>編輯</span>
                    </button>
                    <button onClick={handleSavePhoto}>
                        <FaSave />
                        <span>保存</span>
                    </button>
                    <button onClick={handleNewPhoto}>
                        <FaRedo />
                        <span>重新拍攝</span>
                    </button>
                </div>
            )}

            {currentView === 'editor' && (
                <div className="photo-bottom-menu">
                    <button onClick={handleCropPhoto} >
                        <FaCrop />
                        <span>裁切</span>
                    </button>
                    <button onClick={handleCancelEdit} >
                        <FaTimes />
                        <span>取消</span>
                    </button>
                </div>
            )}

            {currentView === 'result' && (
                <div className="photo-bottom-menu">
                    <button onClick={handleOpenAnalysisChoice} >
                        <FaPlus />
                        <span>開始分析</span>
                    </button>
                    <button onClick={handleNewPhoto} >
                        <FaRedo />
                        <span>重新拍攝</span>
                    </button>
                </div>
            )}

            {showAnalysisModal && (
                <div className="photo-analysis-modal" role="dialog" aria-modal="true">
                    <div className="photo-analysis-modal__content">
                        <h3>選擇分析項目</h3>
                        <p>請選擇要進行的分析頁面：</p>
                        <div className="photo-analysis-modal__actions">
                            <button onClick={() => handleSelectAnalysis('spine')}>
                                頸部分析
                            </button>
                            <button onClick={() => handleSelectAnalysis('tail')}>
                                尾椎分析
                            </button>
                        </div>
                        <button className="photo-analysis-modal__close" onClick={handleCloseAnalysisChoice}>
                            取消
                        </button>
                    </div>
                </div>
            )}

            {showCameraOverlay && (
                <div className="photo-camera-overlay" role="dialog" aria-modal="true">
                    <div className="photo-camera-overlay__frame">
                        <video
                            ref={videoRef}
                            className="photo-camera-overlay__video"
                            playsInline
                            autoPlay
                            muted
                        />
                        <ScaleIndicator className="scale-indicator--camera" />
                        <div className="photo-camera-overlay__controls">
                            <button onClick={handleCaptureFromStream}>
                                拍照
                            </button>
                            <button onClick={handleCloseCameraOverlay}>
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PhotoCapture;
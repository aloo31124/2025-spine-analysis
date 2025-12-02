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

/** 計算 Base64 圖片資料的實際位元組大小 */
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
    /** 檢測當前設備類型（移動端/桌面端）並設置對應提示訊息 */
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
    /** 停止攝像頭串流並釋放相關資源 */
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



    // === 拍攝照片處理 ===
    /** 啟動攝像頭拍照功能，自動判斷是否支援 getUserMedia API */
    const handleCameraCapture = useCallback(() => {
        setShowCameraOverlay(true);
    }, []);


    /** 從攝像頭串流擷取當前畫面並轉為圖片 */
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
            console.log(' canvas toDataUrl: ', dataUrl);

            // 精簡成兩行
            // await updatePreviewFromDataUrl(dataUrl); // 圖片過大，會造成無法轉換
            // const optimizedDataUrl = await optimizeImageData(dataUrl);
            setPreviewUrl(dataUrl);
            setCurrentView('preview');

            setShowCameraOverlay(false);
            stopCameraStream();
        } catch (error) {
            console.error('拍照失敗:', error);
            alert('拍照失敗，請重試');
        } finally {
            setIsProcessing(false);
        }
    }, [stopCameraStream]);

    /** 關閉攝像頭覆蓋層並停止串流 */
    const handleCloseCameraOverlay = useCallback(() => {
        setShowCameraOverlay(false);
        stopCameraStream();
    }, [stopCameraStream]);


    // === 渲染主界面 ===
    /** 渲染初始主畫面：拍攝/上傳按鈕與設備資訊 */
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
                
                <div className="device-info-display">
                    {deviceInfo}
                </div>
            </div>
        </div>
    );

    // === 渲染預覽界面 ===
    /** 渲染圖片預覽畫面：顯示已選擇的圖片與比例尺 */
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


    return (
        <div className="photo-capture">
            {/* 隱藏的文件輸入 */}
            
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
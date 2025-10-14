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
    useEffect(() => {
        detectDevice();
        return () => {
            // 清理視頻流
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [detectDevice]);

    // === 處理文件選擇 ===
    const handleFileSelect = useCallback((file) => {
        if (!file) return;
        
        setIsProcessing(true);
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const url = e.target.result;
            setPreviewUrl(url);
            setImageData(url);
            setCurrentView('preview');
            setIsProcessing(false);
        };
        
        reader.onerror = () => {
            alert('讀取文件時發生錯誤，請重新選擇文件');
            setIsProcessing(false);
        };
        
        reader.readAsDataURL(file);
    }, []);

    // === 拍攝照片處理 ===
    const handleCameraCapture = useCallback(() => {
        if (isMobileDevice) {
            // 移動設備：使用 HTML5 File Input API
            if (cameraInputRef.current) {
                cameraInputRef.current.click();
            }
        } else {
            // 桌面設備：使用 getUserMedia API
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                setIsProcessing(true);
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then((mediaStream) => {
                        streamRef.current = mediaStream;
                        
                        // 創建視頻元素用於拍照
                        const video = document.createElement('video');
                        video.srcObject = mediaStream;
                        video.play();
                        
                        // 創建畫布用於拍照
                        const canvas = canvasRef.current;
                        const ctx = canvas.getContext('2d');
                        
                        video.addEventListener('loadedmetadata', () => {
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            
                            // 延遲拍照以確保攝像頭準備完成
                            setTimeout(() => {
                                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                const dataUrl = canvas.toDataURL('image/png');
                                
                                setPreviewUrl(dataUrl);
                                setImageData(dataUrl);
                                setCurrentView('preview');
                                setIsProcessing(false);
                                
                                // 停止視頻串流
                                mediaStream.getTracks().forEach(track => track.stop());
                                streamRef.current = null;
                            }, 500);
                        });
                    })
                    .catch((error) => {
                        console.error('攝像頭訪問錯誤:', error);
                        setIsProcessing(false);
                        
                        if (error.name === 'NotAllowedError') {
                            alert('攝像頭權限被拒絕，請在瀏覽器設定中允許攝像頭權限');
                        } else if (error.name === 'NotFoundError') {
                            alert('未檢測到攝像頭設備，請確認設備已正確連接');
                        } else {
                            alert(`無法訪問攝像頭: ${error.message || '未知錯誤'}`);
                        }
                    });
            } else {
                alert('您的瀏覽器不支持攝像頭功能，請使用較新版本的瀏覽器');
            }
        }
    }, [isMobileDevice]);

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
    const handleCropPhoto = useCallback(() => {
        if (!editorImageRef.current || !canvasRef.current) return;
        
        const img = editorImageRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
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
        setPreviewUrl(croppedDataUrl);
        setImageData(croppedDataUrl);
        
        setCurrentView('preview');
    }, [cropArea]);

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
        
        // 清理文件輸入
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    }, []);

    // === 切換到分析頁面並傳遞照片 ===
    const handleGoToAnalysis = useCallback(() => {
        if (imageData) {
            // 將照片數據保存到 localStorage
            localStorage.setItem('spineAnalysisPhoto', imageData);
            localStorage.setItem('spineAnalysisPhotoTimestamp', Date.now().toString());
            
            // 導航到脊椎分析頁面
            navigate('/manager/analysis/spine');
        } else {
            alert('請先拍攝或選擇一張照片');
        }
    }, [imageData, navigate]);

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
                    <button onClick={handleGoToAnalysis}>
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
                    <button onClick={handleGoToAnalysis} >
                        <FaPlus />
                        <span>開始分析</span>
                    </button>
                    <button onClick={handleNewPhoto} >
                        <FaRedo />
                        <span>重新拍攝</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default PhotoCapture;
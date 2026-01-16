import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductInventoryPage.module.css';
import { getPillowInventoryList, getMattressInventoryList, updatePillowStock, updateMattressStock } from '../../api/manager/productInventory';

/**
 * 商品庫存頁面
 * 顯示當前使用者擁有的枕頭商品與床墊商品庫存清單
 * 使用 Tab 切換枕頭與床墊商品列表
 */
function ProductInventoryPage() {
    const navigate = useNavigate();
    
    // 當前 Tab: 'pillow' 或 'mattress'
    const [activeTab, setActiveTab] = useState('pillow');
    
    // 枕頭商品庫存清單
    const [pillowList, setPillowList] = useState([]);
    // 床墊商品庫存清單
    const [mattressList, setMattressList] = useState([]);
    
    // 載入狀態
    const [isLoading, setIsLoading] = useState(false);
    // 錯誤訊息
    const [error, setError] = useState(null);
    
    // 編輯中的庫存 (key: productId, value: 編輯中的庫存數量)
    const [editingStock, setEditingStock] = useState({});

    // 頁面載入時取得庫存資料
    useEffect(() => {
        fetchInventoryData();
    }, []);

    /**
     * 取得庫存資料
     */
    const fetchInventoryData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 從localStorage取得選中的店長ID和當前用戶ID
            const selectedManagerId = localStorage.getItem('selectedStoreManagerId');
            const userId = localStorage.getItem('userId') || '';
            
            // 同時取得枕頭與床墊庫存
            const [pillowRes, mattressRes] = await Promise.all([
                getPillowInventoryList(userId, selectedManagerId || ''),
                getMattressInventoryList(userId, selectedManagerId || '')
            ]);
            
            setPillowList(pillowRes.data.result || []);
            setMattressList(mattressRes.data.result || []);
        } catch (err) {
            console.error('取得庫存資料失敗:', err);
            setError('取得庫存資料失敗，請稍後再試');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 開始編輯庫存
     */
    const handleStartEdit = (productId, currentStock) => {
        setEditingStock(prev => ({
            ...prev,
            [productId]: currentStock
        }));
    };

    /**
     * 取消編輯
     */
    const handleCancelEdit = (productId) => {
        setEditingStock(prev => {
            const newState = { ...prev };
            delete newState[productId];
            return newState;
        });
    };

    /**
     * 庫存輸入變更
     */
    const handleStockChange = (productId, value) => {
        setEditingStock(prev => ({
            ...prev,
            [productId]: value
        }));
    };

    /**
     * 儲存庫存
     */
    const handleSaveStock = async (productId, isPillow) => {
        const newStock = editingStock[productId];
        if (newStock === undefined || newStock === '') return;
        
        try {
            if (isPillow) {
                await updatePillowStock(productId, Number(newStock));
                // 更新本地資料
                setPillowList(prev => prev.map(item => 
                    item.id === productId ? { ...item, stock: Number(newStock) } : item
                ));
            } else {
                await updateMattressStock(productId, Number(newStock));
                // 更新本地資料
                setMattressList(prev => prev.map(item => 
                    item.id === productId ? { ...item, stock: Number(newStock) } : item
                ));
            }
            
            // 清除編輯狀態
            handleCancelEdit(productId);
        } catch (err) {
            console.error('更新庫存失敗:', err);
            alert('更新庫存失敗，請稍後再試');
        }
    };

    /**
     * 渲染庫存表格
     */
    const renderInventoryTable = (dataList, isPillow) => {
        if (dataList.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <p>尚無{isPillow ? '枕頭' : '床墊'}商品資料</p>
                </div>
            );
        }

        return (
            <table className={styles.inventoryTable}>
                <thead>
                    <tr>
                        <th>商品名稱</th>
                        <th>商品編號</th>
                        <th>庫存數量</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {dataList.map(item => (
                        <tr key={item.id}>
                            <td>{item.name || '-'}</td>
                            <td>{isPillow ? item.type : item.model || '-'}</td>
                            <td>
                                {editingStock[item.id] !== undefined ? (
                                    <input
                                        type="number"
                                        min="0"
                                        className={styles.stockInput}
                                        value={editingStock[item.id]}
                                        onChange={(e) => handleStockChange(item.id, e.target.value)}
                                    />
                                ) : (
                                    <span className={item.stock <= 0 ? styles.lowStock : ''}>
                                        {item.stock || 0}
                                    </span>
                                )}
                            </td>
                            <td>
                                {editingStock[item.id] !== undefined ? (
                                    <div className={styles.actionButtons}>
                                        <button 
                                            className={styles.saveBtn}
                                            onClick={() => handleSaveStock(item.id, isPillow)}
                                        >
                                            儲存
                                        </button>
                                        <button 
                                            className={styles.cancelBtn}
                                            onClick={() => handleCancelEdit(item.id)}
                                        >
                                            取消
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        className={styles.editBtn}
                                        onClick={() => handleStartEdit(item.id, item.stock || 0)}
                                    >
                                        編輯
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    /**
     * 渲染手機版卡片
     */
    const renderMobileCards = (dataList, isPillow) => {
        if (dataList.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <p>尚無{isPillow ? '枕頭' : '床墊'}商品資料</p>
                </div>
            );
        }

        return (
            <div className={styles.cardContainer}>
                {dataList.map(item => (
                    <div key={item.id} className={styles.inventoryCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>{item.name || '-'}</span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>商品編號：</span>
                                <span className={styles.cardValue}>
                                    {isPillow ? item.type : item.model || '-'}
                                </span>
                            </div>
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>庫存數量：</span>
                                {editingStock[item.id] !== undefined ? (
                                    <input
                                        type="number"
                                        min="0"
                                        className={styles.stockInput}
                                        value={editingStock[item.id]}
                                        onChange={(e) => handleStockChange(item.id, e.target.value)}
                                    />
                                ) : (
                                    <span className={`${styles.cardValue} ${item.stock <= 0 ? styles.lowStock : ''}`}>
                                        {item.stock || 0}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className={styles.cardActions}>
                            {editingStock[item.id] !== undefined ? (
                                <>
                                    <button 
                                        className={styles.saveBtn}
                                        onClick={() => handleSaveStock(item.id, isPillow)}
                                    >
                                        儲存
                                    </button>
                                    <button 
                                        className={styles.cancelBtn}
                                        onClick={() => handleCancelEdit(item.id)}
                                    >
                                        取消
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={styles.editBtn}
                                    onClick={() => handleStartEdit(item.id, item.stock || 0)}
                                >
                                    編輯庫存
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>商品庫存</h1>
                <p>
                    該庫存綁定當前使用者id (userId)
                </p>
                <button 
                    className={styles.refreshBtn}
                    onClick={fetchInventoryData}
                    disabled={isLoading}
                >
                    {isLoading ? '載入中...' : '重新整理'}
                </button>
            </div>

            {/* Tab 切換 */}
            <div className={styles.tabContainer}>
                <button 
                    className={`${styles.tab} ${activeTab === 'pillow' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('pillow')}
                >
                    枕頭商品
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'mattress' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('mattress')}
                >
                    床墊商品
                </button>
            </div>

            {/* 錯誤訊息 */}
            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            {/* 載入中 */}
            {isLoading ? (
                <div className={styles.loadingState}>
                    <p>載入中...</p>
                </div>
            ) : (
                <>
                    {/* 桌面版表格 */}
                    <div className={styles.desktopView}>
                        {activeTab === 'pillow' 
                            ? renderInventoryTable(pillowList, true)
                            : renderInventoryTable(mattressList, false)
                        }
                    </div>

                    {/* 手機版卡片 */}
                    <div className={styles.mobileView}>
                        {activeTab === 'pillow' 
                            ? renderMobileCards(pillowList, true)
                            : renderMobileCards(mattressList, false)
                        }
                    </div>
                </>
            )}

            {/* 統計資訊 */}
            <div className={styles.statsContainer}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>
                        {activeTab === 'pillow' ? '枕頭商品總數' : '床墊商品總數'}：
                    </span>
                    <span className={styles.statValue}>
                        {activeTab === 'pillow' ? pillowList.length : mattressList.length}
                    </span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>總庫存量：</span>
                    <span className={styles.statValue}>
                        {activeTab === 'pillow' 
                            ? pillowList.reduce((sum, item) => sum + (item.stock || 0), 0)
                            : mattressList.reduce((sum, item) => sum + (item.stock || 0), 0)
                        }
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ProductInventoryPage;

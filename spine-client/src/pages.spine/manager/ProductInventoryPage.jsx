import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductInventoryPage.module.css';
import { getPillowInventory, getMattressInventory, updateStoreStock } from '../../api/manager/stock';

/**
 * 商品庫存頁面 (重構版)
 * 顯示店長管理的所有店面的商品庫存
 * 每個商品列出所有店面的庫存數量
 */
function ProductInventoryPage() {
    const navigate = useNavigate();
    
    // 當前 Tab: 'pillow' 或 'mattress'
    const [activeTab, setActiveTab] = useState('pillow');
    
    // 枕頭商品庫存清單 (包含各店面庫存)
    const [pillowList, setPillowList] = useState([]);
    // 床墊商品庫存清單 (包含各店面庫存)
    const [mattressList, setMattressList] = useState([]);
    // 店面列表
    const [stores, setStores] = useState([]);
    
    // 載入狀態
    const [isLoading, setIsLoading] = useState(false);
    // 錯誤訊息
    const [error, setError] = useState(null);
    
    // 編輯中的庫存 (key: `${productId}_${storeId}`, value: 編輯中的庫存數量)
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
            // 同時取得枕頭與床墊庫存
            const [pillowRes, mattressRes] = await Promise.all([
                getPillowInventory(),
                getMattressInventory()
            ]);
            
            console.log('枕頭庫存回應:', pillowRes.data);
            console.log('床墊庫存回應:', mattressRes.data);
            
            if (pillowRes.data.result === '200' && pillowRes.data.data) {
                setPillowList(pillowRes.data.data.pillowList || []);
                setStores(pillowRes.data.data.stores || []);
            } else if (pillowRes.data.result === '403') {
                setError(pillowRes.data.message || '權限不足');
            }
            
            if (mattressRes.data.result === '200' && mattressRes.data.data) {
                setMattressList(mattressRes.data.data.mattressList || []);
                // 店面列表以枕頭的為準（應該相同）
                if (stores.length === 0) {
                    setStores(mattressRes.data.data.stores || []);
                }
            } else if (mattressRes.data.result === '403') {
                setError(mattressRes.data.message || '權限不足');
            }
        } catch (err) {
            console.error('取得庫存資料失敗:', err);
            setError(err.response?.data?.message || '取得庫存資料失敗');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 開始編輯庫存
     */
    const handleStartEdit = (productId, storeId, currentStock) => {
        const key = `${productId}_${storeId}`;
        setEditingStock(prev => ({
            ...prev,
            [key]: currentStock
        }));
    };

    /**
     * 取消編輯
     */
    const handleCancelEdit = (productId, storeId) => {
        const key = `${productId}_${storeId}`;
        setEditingStock(prev => {
            const newState = { ...prev };
            delete newState[key];
            return newState;
        });
    };

    /**
     * 庫存輸入變更
     */
    const handleStockChange = (productId, storeId, value) => {
        const key = `${productId}_${storeId}`;
        setEditingStock(prev => ({
            ...prev,
            [key]: value
        }));
    };

    /**
     * 儲存庫存
     */
    const handleSaveStock = async (productId, storeId, productType) => {
        const key = `${productId}_${storeId}`;
        const newStock = editingStock[key];
        
        if (newStock === undefined || newStock === '') {
            alert('請輸入庫存數量');
            return;
        }
        
        try {
            setIsLoading(true);
            await updateStoreStock({
                productId,
                productType,
                storeId,
                stock: Number(newStock)
            });
            
            // 取消編輯狀態
            handleCancelEdit(productId, storeId);
            
            // 重新整理資料
            await fetchInventoryData();
            
            alert('庫存更新成功');
        } catch (err) {
            console.error('更新庫存失敗:', err);
            alert(err.response?.data?.message || '更新庫存失敗');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 渲染庫存表格 (桌面版)
     */
    const renderInventoryTable = (dataList, isPillow) => {
        if (dataList.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <p>目前沒有商品</p>
                </div>
            );
        }

        const productType = isPillow ? 'Pillow' : 'Mattress';

        return (
            <table className={styles.inventoryTable}>
                <thead>
                    <tr>
                        <th>商品名稱</th>
                        <th>商品編號</th>
                        <th>總庫存</th>
                        {stores.map(store => (
                            <th key={store.id}>{store.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {dataList.map(item => (
                        <tr key={item.id}>
                            <td>{item.name || '-'}</td>
                            <td>{isPillow ? item.type : item.model || '-'}</td>
                            <td>
                                <span className={item.totalStock <= 0 ? styles.lowStock : ''}>
                                    {item.totalStock || 0}
                                </span>
                            </td>
                            {item.storeStocks && item.storeStocks.map(storeStock => {
                                const key = `${item.id}_${storeStock.storeId}`;
                                const isEditing = editingStock[key] !== undefined;
                                
                                return (
                                    <td key={storeStock.storeId}>
                                        {isEditing ? (
                                            <div className={styles.editCell}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className={styles.stockInput}
                                                    value={editingStock[key]}
                                                    onChange={(e) => handleStockChange(item.id, storeStock.storeId, e.target.value)}
                                                />
                                                <button 
                                                    className={styles.saveBtn}
                                                    onClick={() => handleSaveStock(item.id, storeStock.storeId, productType)}
                                                >
                                                    ✓
                                                </button>
                                                <button 
                                                    className={styles.cancelBtn}
                                                    onClick={() => handleCancelEdit(item.id, storeStock.storeId)}
                                                >
                                                    ✗
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.viewCell}>
                                                <span className={storeStock.stock <= 0 ? styles.lowStock : ''}>
                                                    {storeStock.stock || 0}
                                                </span>
                                                <button 
                                                    className={styles.editIconBtn}
                                                    onClick={() => handleStartEdit(item.id, storeStock.storeId, storeStock.stock || 0)}
                                                >
                                                    ✎
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
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
                    <p>目前沒有商品</p>
                </div>
            );
        }

        const productType = isPillow ? 'Pillow' : 'Mattress';

        return (
            <div className={styles.mobileCardsContainer}>
                {dataList.map(item => (
                    <div key={item.id} className={styles.productCard}>
                        <div className={styles.cardHeader}>
                            <h3>{item.name || '-'}</h3>
                            <span className={styles.productType}>
                                {isPillow ? item.type : item.model || '-'}
                            </span>
                        </div>
                        
                        <div className={styles.totalStock}>
                            <span className={styles.label}>總庫存：</span>
                            <span className={item.totalStock <= 0 ? styles.lowStock : styles.stockValue}>
                                {item.totalStock || 0}
                            </span>
                        </div>

                        <div className={styles.storeStocksSection}>
                            <h4>各店面庫存：</h4>
                            {item.storeStocks && item.storeStocks.map(storeStock => {
                                const key = `${item.id}_${storeStock.storeId}`;
                                const isEditing = editingStock[key] !== undefined;
                                
                                return (
                                    <div key={storeStock.storeId} className={styles.storeStockRow}>
                                        <span className={styles.storeName}>{storeStock.storeName}：</span>
                                        {isEditing ? (
                                            <div className={styles.editCell}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className={styles.stockInput}
                                                    value={editingStock[key]}
                                                    onChange={(e) => handleStockChange(item.id, storeStock.storeId, e.target.value)}
                                                />
                                                <button 
                                                    className={styles.saveBtn}
                                                    onClick={() => handleSaveStock(item.id, storeStock.storeId, productType)}
                                                >
                                                    儲存
                                                </button>
                                                <button 
                                                    className={styles.cancelBtn}
                                                    onClick={() => handleCancelEdit(item.id, storeStock.storeId)}
                                                >
                                                    取消
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.viewCell}>
                                                <span className={storeStock.stock <= 0 ? styles.lowStock : ''}>
                                                    {storeStock.stock || 0}
                                                </span>
                                                <button 
                                                    className={styles.editBtn}
                                                    onClick={() => handleStartEdit(item.id, storeStock.storeId, storeStock.stock || 0)}
                                                >
                                                    編輯
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
                <p className={styles.description}>
                    管理您店面的商品庫存 - 每個商品可在不同店面設定不同庫存數量
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

            {/* 內容區 */}
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
                            ? pillowList.reduce((sum, item) => sum + (item.totalStock || 0), 0)
                            : mattressList.reduce((sum, item) => sum + (item.totalStock || 0), 0)
                        }
                    </span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>管理店面數：</span>
                    <span className={styles.statValue}>
                        {stores.length}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ProductInventoryPage;

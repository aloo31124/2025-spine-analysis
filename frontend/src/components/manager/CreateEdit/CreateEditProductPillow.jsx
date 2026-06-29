import React, { useEffect, useState } from 'react';
import style from './CreateEdit.module.css';
import { PILLOW_MODEL_OPTIONS } from '../../../utils/pillowModelOptions';
import { getProductStock, batchUpdateProductStock } from '../../../api/manager/stock';
import { getMyStores } from '../../../api/manager/store';

/**
 * 枕頭商品新增/編輯組件
 * 獨立於 CreateEditProduct，專門處理枕頭商品的特殊欄位
 */
function CreateEditProductPillow({ typePage, productPillow, 
    handleUpdateProductPillow, handleAddProductPillow }) {
    // 編輯新增頁狀態
    const typePageList = { CREATE: "CREATE", EDIT: 'EDIT' };
    
    // 基本商品資訊
    const [name, setName] = useState("");
    const [state, setState] = useState("草稿");
    const [type, setType] = useState("");
    const [price, setPrice] = useState(0);
    
    // 枕頭專屬欄位
    const [shortHeight, setShortHeight] = useState(0);       // 短高度
    const [longHeight, setLongHeight] = useState(0);         // 長高度
    const [shortCurvature, setShortCurvature] = useState(0); // 短弧度
    const [mediumCurvature, setMediumCurvature] = useState(0); // 中弧度
    const [longCurvature, setLongCurvature] = useState(0);   // 長弧度
    
    // 店面庫存
    const [stores, setStores] = useState([]);                // 店面列表
    const [storeStocks, setStoreStocks] = useState([]);      // 各店面庫存 [{ storeId, storeName, stock }]

    /* 初始枕頭商品資訊 */
    useEffect(() => {
        if (productPillow) {
            setName(productPillow.name || "");
            setState(productPillow.state || "草稿");
            setType(productPillow.type || "");
            setPrice(productPillow.price || 0);
            setShortHeight(productPillow.shortHeight || 0);
            setLongHeight(productPillow.longHeight || 0);
            setShortCurvature(productPillow.shortCurvature || 0);
            setMediumCurvature(productPillow.mediumCurvature || 0);
            setLongCurvature(productPillow.longCurvature || 0);
        }
    }, [productPillow]);
    
    /* 載入店面列表和庫存資料 */
    useEffect(() => {
        const fetchStoresAndStock = async () => {
            try {
                // 取得店長管理的店面列表（從 JWT 自動取得）
                const storesRes = await getMyStores();
                if (storesRes.data.result === '200') {
                    const storeList = storesRes.data.stores || [];
                    setStores(storeList);
                    
                    // 如果是編輯模式且有商品 ID，取得各店面的庫存
                    if (typePage === typePageList.EDIT && productPillow?.id) {
                        const stockRes = await getProductStock(productPillow.id, 'Pillow');
                        if (stockRes.data.result === '200' && stockRes.data.data.storeStocks) {
                            setStoreStocks(stockRes.data.data.storeStocks);
                        } else {
                            // 如果沒有庫存資料，初始化為 0
                            setStoreStocks(storeList.map(store => ({
                                storeId: store.id,
                                storeName: store.name,
                                stock: 0
                            })));
                        }
                    } else {
                        // 新增模式，初始化所有店面庫存為 0
                        setStoreStocks(storeList.map(store => ({
                            storeId: store.id,
                            storeName: store.name,
                            stock: 0
                        })));
                    }
                } else if (storesRes.data.result === '403') {
                    alert(storesRes.data.message || '權限不足：您不是店長');
                }
            } catch (error) {
                console.error('取得店面列表或庫存失敗:', error);
                if (error.response?.data?.message) {
                    alert(error.response.data.message);
                }
            }
        };
        
        fetchStoresAndStock();
    }, [productPillow, typePage]);

    /* post 新增枕頭商品 */
    const clickAddProductPillow = async () => {
        if (typePage !== typePageList.CREATE) return;
        
        try {
            // 先新增商品
            const newProduct = await handleAddProductPillow({
                name,
                state,
                type,
                price: Number(price),
                shortHeight: Number(shortHeight),
                longHeight: Number(longHeight),
                shortCurvature: Number(shortCurvature),
                mediumCurvature: Number(mediumCurvature),
                longCurvature: Number(longCurvature)
            });
            
            // 如果有商品 ID，批量更新庫存
            if (newProduct?.id && storeStocks.length > 0) {
                await batchUpdateProductStock({
                    productId: newProduct.id,
                    productType: 'Pillow',
                    storeStockList: storeStocks
                });
            }
        } catch (error) {
            console.error('新增枕頭商品或庫存失敗:', error);
            throw error;
        }
    }

    /* 更新枕頭商品 */
    const clickUpdateProductPillow = async () => {
        if (typePage !== typePageList.EDIT) return;
        
        try {
            // 先更新商品基本資料
            await handleUpdateProductPillow({
                name,
                state,
                type,
                price: Number(price),
                shortHeight: Number(shortHeight),
                longHeight: Number(longHeight),
                shortCurvature: Number(shortCurvature),
                mediumCurvature: Number(mediumCurvature),
                longCurvature: Number(longCurvature)
            });
            
            // 批量更新各店面庫存
            if (productPillow?.id && storeStocks.length > 0) {
                await batchUpdateProductStock({
                    productId: productPillow.id,
                    productType: 'Pillow',
                    storeStockList: storeStocks
                });
            }
        } catch (error) {
            console.error('更新枕頭商品或庫存失敗:', error);
            throw error;
        }
    }
    
    /* 更新單一店面庫存 */
    const handleStoreStockChange = (storeId, newStock) => {
        setStoreStocks(prev => prev.map(item => 
            item.storeId === storeId ? { ...item, stock: Number(newStock) || 0 } : item
        ));
    };

    return (
        <div className={style.CreateEditProduct}>
            {/* 頂部操作區 */}
            <div className={style.CreateEditProductTopBar}>
                <div className={style.CreateEditProductRow}>
                    {typePage === typePageList.CREATE ?
                        <button onClick={clickAddProductPillow}>新增</button>
                        : <button onClick={clickUpdateProductPillow}>儲存</button>
                    }
                    <button>刪除</button>
                </div>
                <div className={style.CreateEditProductRow}>
                    <input className={style.CreateEditProductTopInput}
                        type="text"
                        placeholder='枕頭商品名稱'
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
            </div>

            {/* 枕頭型號 */}
            <div className={style.CreateEditProductContainer}>
                <h2>枕頭型號</h2>
                <div className={style.CreateEditProductRow}>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                    >
                        <option value="">請選擇枕頭型號</option>
                        {PILLOW_MODEL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 商品價格 */}
            <div className={style.CreateEditProductContainer}>
                <h2>商品價格</h2>
                <div className={style.CreateEditProductRow}>
                    <input type="number"
                        placeholder='商品價格'
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                    />
                </div>
            </div>

            {/* 店面庫存設定 */}
            <div className={style.CreateEditProductContainer}>
                <h2>店面庫存設定</h2>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                    請為每個店面設定此商品的庫存數量
                </p>
                {storeStocks.length === 0 ? (
                    <div className={style.CreateEditProductRow}>
                        <p style={{ color: '#999' }}>目前沒有管理店面，請先新增店面</p>
                    </div>
                ) : (
                    storeStocks.map((storeStock) => (
                        <div key={storeStock.storeId} className={style.CreateEditProductRow}>
                            <label style={{ minWidth: '150px' }}>{storeStock.storeName}：</label>
                            <input 
                                type="number"
                                placeholder='庫存數量'
                                value={storeStock.stock}
                                min="0"
                                onChange={e => handleStoreStockChange(storeStock.storeId, e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <span style={{ marginLeft: '10px', color: '#666' }}>件</span>
                        </div>
                    ))
                )}
            </div>

            {/* 枕頭高度設定 */}
            <div className={style.CreateEditProductContainer}>
                <h2>枕頭高度設定</h2>
                <div className={style.CreateEditProductRow}>
                    <label>短高度 (cm):</label>
                    <input type="number"
                        placeholder='短高度'
                        value={shortHeight}
                        onChange={e => setShortHeight(e.target.value)}
                        step="0.1"
                    />
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>長高度 (cm):</label>
                    <input type="number"
                        placeholder='長高度'
                        value={longHeight}
                        onChange={e => setLongHeight(e.target.value)}
                        step="0.1"
                    />
                </div>
            </div>

            {/* 枕頭弧度設定 */}
            <div className={style.CreateEditProductContainer}>
                <h2>枕頭弧度設定</h2>
                <div className={style.CreateEditProductRow}>
                    <label>短弧度 (°):</label>
                    <input type="number"
                        placeholder='短弧度'
                        value={shortCurvature}
                        onChange={e => setShortCurvature(e.target.value)}
                        step="0.1"
                    />
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>中弧度 (°):</label>
                    <input type="number"
                        placeholder='中弧度'
                        value={mediumCurvature}
                        onChange={e => setMediumCurvature(e.target.value)}
                        step="0.1"
                    />
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>長弧度 (°):</label>
                    <input type="number"
                        placeholder='長弧度'
                        value={longCurvature}
                        onChange={e => setLongCurvature(e.target.value)}
                        step="0.1"
                    />
                </div>
            </div>

            {/* 商品說明 */}
            <div className={style.CreateEditProductContainer}>
                <h2>商品說明</h2>
                <textarea
                    placeholder="請輸入枕頭商品說明..."
                    style={{ width: '100%', minHeight: '100px', padding: '10px' }}
                />
            </div>
        </div>
    );
}

export default CreateEditProductPillow;

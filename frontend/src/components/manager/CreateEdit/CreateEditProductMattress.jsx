import React, { useEffect, useState } from 'react';
import style from './CreateEdit.module.css';
import { getProductStock, batchUpdateProductStock } from '../../../api/manager/stock';
import { getMyStores } from '../../../api/manager/store';

/**
 * 床墊商品新增/編輯組件
 * 參考 CreateEditProductPillow，專門處理床墊商品
 */
function CreateEditProductMattress({ typePage, productMattress, 
    handleUpdateProductMattress, handleAddProductMattress }) {
    // 編輯新增頁狀態
    const typePageList = { CREATE: "CREATE", EDIT: 'EDIT' };
    
    // 床墊型號選項
    const mattressModelOptions = [
        '1號床墊',
        '2號床墊',
        '3號床墊',
        '4號床墊',
        '1+1號床墊(1號床墊加厚1公分)'
    ];
    
    // 基本商品資訊
    const [name, setName] = useState("");
    const [state, setState] = useState("草稿");
    const [model, setModel] = useState("1號床墊");
    const [price, setPrice] = useState(0);
    
    // 店面庫存
    const [stores, setStores] = useState([]);                // 店面列表
    const [storeStocks, setStoreStocks] = useState([]);      // 各店面庫存 [{ storeId, storeName, stock }]

    /* 初始床墊商品資訊 */
    useEffect(() => {
        if (productMattress) {
            setName(productMattress.name || "");
            setState(productMattress.state || "草稿");
            setModel(productMattress.model || "1號床墊");
            setPrice(productMattress.price || 0);
        }
    }, [productMattress]);
    
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
                    if (typePage === typePageList.EDIT && productMattress?.id) {
                        const stockRes = await getProductStock(productMattress.id, 'Mattress');
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
    }, [productMattress, typePage]);

    /* post 新增床墊商品 */
    const clickAddProductMattress = async () => {
        if (typePage !== typePageList.CREATE) return;
        
        try {
            // 先新增商品
            const newProduct = await handleAddProductMattress({
                name,
                state,
                model,
                price: Number(price)
            });
            
            // 如果有商品 ID，批量更新庫存
            if (newProduct?.id && storeStocks.length > 0) {
                await batchUpdateProductStock({
                    productId: newProduct.id,
                    productType: 'Mattress',
                    storeStockList: storeStocks
                });
            }
        } catch (error) {
            console.error('新增床墊商品或庫存失敗:', error);
            throw error;
        }
    }

    /* 更新床墊商品 */
    const clickUpdateProductMattress = async () => {
        if (typePage !== typePageList.EDIT) return;
        
        try {
            // 先更新商品基本資料
            await handleUpdateProductMattress({
                name,
                state,
                model,
                price: Number(price)
            });
            
            // 批量更新各店面庫存
            if (productMattress?.id && storeStocks.length > 0) {
                await batchUpdateProductStock({
                    productId: productMattress.id,
                    productType: 'Mattress',
                    storeStockList: storeStocks
                });
            }
        } catch (error) {
            console.error('更新床墊商品或庫存失敗:', error);
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
                        <button onClick={clickAddProductMattress}>新增</button>
                        : <button onClick={clickUpdateProductMattress}>儲存</button>
                    }
                    <button>刪除</button>
                </div>
                <div className={style.CreateEditProductRow}>
                    <input className={style.CreateEditProductTopInput}
                        type="text"
                        placeholder='床墊商品名稱'
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
            </div>

            {/* 床墊型號 - 使用下拉選單 */}
            <div className={style.CreateEditProductContainer}>
                <h2>床墊型號</h2>
                <div className={style.CreateEditProductRow}>
                    <select 
                        value={model} 
                        onChange={e => setModel(e.target.value)}
                        style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                    >
                        {mattressModelOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
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

            {/* 商品說明 */}
            <div className={style.CreateEditProductContainer}>
                <h2>商品說明</h2>
                <textarea
                    placeholder="請輸入床墊商品說明..."
                    style={{ width: '100%', minHeight: '100px', padding: '10px' }}
                />
            </div>
        </div>
    );
}

export default CreateEditProductMattress;

import React, { useEffect, useState } from 'react';
import style from './CreateEdit.module.css';

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

    /* post 新增枕頭商品 */
    const clickAddProductPillow = async () => {
        if (typePage !== typePageList.CREATE) return;
        handleAddProductPillow({
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
    }

    /* 更新枕頭商品 */
    const clickUpdateProductPillow = async () => {
        if (typePage !== typePageList.EDIT) return;
        handleUpdateProductPillow({
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
    }

    return (
        <div className={style.CreateEditProduct}>
            {/* 頂部操作區 */}
            <div className={style.CreateEditProductTopBar}>
                <div className={style.CreateEditProductRow}>
                    <span>狀態: {typePage === typePageList.CREATE ? '(新增)' : '(編輯)'} {state}</span>
                    <select value={state} onChange={e => setState(e.target.value)}>
                        <option value="草稿">草稿</option>
                        <option value="上架">上架</option>
                        <option value="下架">下架</option>
                    </select>
                </div>
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

            {/* 枕頭類型 */}
            <div className={style.CreateEditProductContainer}>
                <h2>枕頭類型</h2>
                <div className={style.CreateEditProductRow}>
                    <input
                        type="text"
                        placeholder="枕頭類型 (例如: 記憶棉、乳膠...)"
                        value={type}
                        onChange={e => setType(e.target.value)}
                    />
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

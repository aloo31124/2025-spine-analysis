import React, { useEffect, useState } from 'react';
import style from './CreateEdit.module.css';

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
    const [stock, setStock] = useState(0);  // 庫存數量

    /* 初始床墊商品資訊 */
    useEffect(() => {
        if (productMattress) {
            setName(productMattress.name || "");
            setState(productMattress.state || "草稿");
            setModel(productMattress.model || "1號床墊");
            setPrice(productMattress.price || 0);
            setStock(productMattress.stock || 0);
        }
    }, [productMattress]);

    /* post 新增床墊商品 */
    const clickAddProductMattress = async () => {
        if (typePage !== typePageList.CREATE) return;
        handleAddProductMattress({
            name,
            state,
            model,
            price: Number(price),
            stock: Number(stock)
        });
    }

    /* 更新床墊商品 */
    const clickUpdateProductMattress = async () => {
        if (typePage !== typePageList.EDIT) return;
        handleUpdateProductMattress({
            name,
            state,
            model,
            price: Number(price),
            stock: Number(stock)
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

            {/* 庫存數量 */}
            <div className={style.CreateEditProductContainer}>
                <h2>庫存數量</h2>
                <div className={style.CreateEditProductRow}>
                    <input type="number"
                        placeholder='庫存數量'
                        value={stock}
                        min="0"
                        onChange={e => setStock(e.target.value)}
                    />
                </div>
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

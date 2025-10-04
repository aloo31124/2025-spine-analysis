import React, {useState} from "react";
import style from './MenuLeft.module.css'
import { useNavigate } from 'react-router-dom';


function MenuLeft() {
    const navigate = useNavigate();

    return (
        <div className={style.MenuLeft}>
            <button className={style.MenuLeftButton}
                onClick={e => navigate('/manager/product/list') }
            >
                我的商品
            </button>
            <button className={style.MenuLeftButton}>
                訂單管理
            </button>
            <button className={style.MenuLeftButton}>
                客戶管理
            </button>
            <button className={style.MenuLeftButton}>
                營收管理
            </button>
            <button className={style.MenuLeftButton}>
                優惠管理
            </button>
            <button className={style.MenuLeftButton}>
                頁面編輯
            </button>
            <button className={style.MenuLeftButton}>
                拍賣管理
            </button>
            <button className={style.MenuLeftButton}>
                募資管理
            </button>
            <button className={style.MenuLeftButton}
                onClick={e => navigate('/manager/system') }
            >
                系統管理
            </button>
        </div>
    )
}

export default MenuLeft;

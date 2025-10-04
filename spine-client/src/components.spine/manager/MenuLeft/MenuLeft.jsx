import React, {useState} from "react";
import style from './MenuLeft.module.css'
import { useNavigate } from 'react-router-dom';


function MenuLeft() {
    const navigate = useNavigate();

    return (
        <div className={style.MenuLeft}>
            <button className={style.MenuLeftButton}>
                頸部分析
            </button>
            <button className={style.MenuLeftButton}>
                客戶管理
            </button>
            <button className={style.MenuLeftButton}
                onClick={e => navigate('/manager/product/list') }
            >
                頸枕管理
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

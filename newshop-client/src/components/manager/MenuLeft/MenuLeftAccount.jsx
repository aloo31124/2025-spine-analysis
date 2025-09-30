import React, {useState} from "react";
import style from './MenuLeft.module.css'
import { useNavigate } from 'react-router-dom';


function MenuLeftAccount() {
    const navigate = useNavigate();

    return (
        <div className={style.MenuLeft}>
            <button className={style.MenuLeftButton}
                onClick={e => navigate('/account/info') }
            >
                帳號資訊
            </button>
            <button className={style.MenuLeftButton}
                onClick={e => navigate('/account/shopping/order')}
            >
                購物訂單
            </button>
        </div>
    )
}

export default MenuLeftAccount;

import React, {useState} from "react";
import style from './MenuLeft.module.css'
import { useNavigate } from 'react-router-dom';
import { useMenuCollapse } from '../../../hooks/useMenuCollapse';


function MenuLeft() {
    const navigate = useNavigate();
    const { isCollapsed, isMobile, toggleCollapse } = useMenuCollapse();

    return (
        <>
            <div className={`${style.MenuLeft} ${isCollapsed ? style.collapsed : ''} ${isMobile ? style.mobile : ''}`}>
                <button 
                    className={style.toggleButton}
                    onClick={toggleCollapse}
                    title={isCollapsed ? "展開選單" : "收合選單"}
                >
                    <span className={`${style.toggleIcon} ${isCollapsed ? style.rotated : ''}`}>
                        ◀
                    </span>
                </button>
                
                <div className={`${style.menuContent} ${isCollapsed ? style.hidden : ''}`}>
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/product/list') }
                    >
                        我的商品
                    </button>
                    <button className={style.MenuLeftButton}>
                        訂單管理
                    </button>
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/customer/list') }
                    >
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
            </div>
            
            {isMobile && !isCollapsed && (
                <div 
                    className={style.overlay}
                    onClick={toggleCollapse}
                />
            )}
        </>
    )
}

export default MenuLeft;

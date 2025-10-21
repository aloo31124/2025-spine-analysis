import React, {useState} from "react";
import style from './MenuLeft.module.css'
import { useNavigate } from 'react-router-dom';
import { useMenuCollapse } from '../../../hooks/useMenuCollapse';


function MenuLeftAccount() {
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

export default MenuLeftAccount;

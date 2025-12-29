import React, {useState, useEffect} from "react";
import style from './MenuLeft.module.css'
import { useNavigate } from 'react-router-dom';


function MenuLeft({ isOpen, isHidden, onClose }) {
    const navigate = useNavigate();
    const [userRoles, setUserRoles] = useState([]);
    
    // 從 localStorage 讀取用戶角色
    useEffect(() => {
        const rolesStr = localStorage.getItem('userRoles');
        if (rolesStr) {
            try {
                const roles = JSON.parse(rolesStr);
                setUserRoles(roles);
            } catch (error) {
                console.error('解析用戶角色失敗:', error);
            }
        }
    }, []);

    // 檢查用戶是否有特定角色
    const hasRole = (roleName) => {
        return userRoles.some(r => r.role === roleName);
    };

    // 白名單機制：檢查是否可以訪問某個功能
    const canAccess = (feature) => {
        // 管理員可以訪問所有功能
        if (hasRole('Admin')) return true;

        // 店長的白名單頁面
        const storeManagerWhitelist = [
            'photo-capture',    // 拍照上傳
            'analysis-spine',   // 頸部分析
            'analysis-tail',    // 尾椎分析
            'customer',         // 客戶管理
            'product-pillow',   // 枕頭商品
            'product-mattress', // 床墊商品
            'product-inventory', // 商品庫存
            'revenue'           // 營收管理
        ];
        // 如果是店長，只能訪問白名單內的頁面
        if (hasRole('StoreManager')) {
            return storeManagerWhitelist.includes(feature);
        }

        // 沒有任何角色，不能訪問任何頁面
        return false;
    };
    
    // 處理點擊外部區域關閉選單
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (window.innerWidth <= 800 && isOpen) {
                const menuLeft = e.target.closest(`.${style.MenuLeft}`);
                const hamburger = e.target.closest('[class*="hamburger"]');
                
                if (!menuLeft && !hamburger) {
                    onClose();
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen, onClose]);

    return (
        <>
            {/* 遮罩層 (僅手機版使用) */}
            <div 
                className={`${style.overlay} ${isOpen ? style.active : ''}`}
                onClick={onClose}
            ></div>
            
            <div className={`${style.MenuLeft} ${isOpen ? style.open : ''} ${isHidden ? style.hidden : ''}`}>
                <h3 className={style.MenuTitle}>頸椎分析系統</h3>
                {canAccess('photo-capture') && (
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/photo/capture') }
                    >
                        拍照上傳
                    </button>
                )}
                {canAccess('analysis-spine') && (
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/analysis/spine') }
                    >
                        頸部分析
                    </button>
                )}
                {canAccess('analysis-tail') && (
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/analysis/tail') }
                    >
                        尾椎分析
                    </button>
                )}
                {canAccess('customer') && (
                    <button className={style.MenuLeftButton} 
                        onClick={e => navigate('/manager/customer/list') }
                    >
                        客戶管理
                    </button>
                )}
                {canAccess('product-pillow') && (
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/product-pillow/list') }
                    >
                        枕頭商品
                    </button>
                )}
                {canAccess('product-mattress') && (
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/product-mattress/list') }
                    >
                        床墊管理
                    </button>
                )}
                {canAccess('product-inventory') && (
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/product-inventory') }
                    >
                        商品庫存
                    </button>
                )}
                {canAccess('revenue') && (
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/report/revenue-line-chart') }
                    >
                        營收管理
                    </button>
                )}
                {hasRole('Admin') && (
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/role-management') }
                    >
                        分權設定
                    </button>
                )}
                {hasRole('Admin') && (
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/payment/list') }
                    >
                        方案管理
                    </button>
                )}
                {hasRole('Admin') && (
                    <button className={style.MenuLeftButton}
                        onClick={e => navigate('/manager/system') }
                    >
                        系統管理
                    </button>
                )}
            </div>
        </>
    )
}

export default MenuLeft;

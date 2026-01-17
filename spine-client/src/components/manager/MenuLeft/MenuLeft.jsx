import React, {useState, useEffect} from "react";
import style from './MenuLeft.module.css'
import { useNavigate } from 'react-router-dom';


function MenuLeft() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // 監聽視窗大小變化
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 800;
            setIsMobile(mobile);
            if (mobile) {
                setIsMenuOpen(false);
            } else {
                setIsMenuOpen(true);
            }
        };

        handleResize(); // 初始檢查
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        if (isMobile) {
            setIsMenuOpen(false);
        }
    };

    return (
        <>
            {/* 漢堡選單圖標 */}
            {(!isMenuOpen || isMobile) && (
                <button 
                    className={style.hamburgerButton}
                    onClick={toggleMenu}
                    aria-label="開啟選單"
                >
                    <div className={style.hamburgerIcon}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
            )}

            {/* 遮罩層（僅在手機版且選單開啟時顯示） */}
            {isMobile && isMenuOpen && (
                <div className={style.overlay} onClick={closeMenu}></div>
            )}

            {/* 左側選單 */}
            <div className={`${style.MenuLeft} ${isMenuOpen ? style.menuOpen : style.menuClosed} ${isMobile ? style.mobileMenu : ''}`}>
                {/* 關閉按鈕 */}
                <button 
                    className={style.closeButton}
                    onClick={closeMenu}
                    aria-label="關閉選單"
                >
                    ×
                </button>

                <button className={style.MenuLeftButton}
                    onClick={e => navigate('/manager/product/list') }
                >
                    我的商品
                </button>
                <button className={style.MenuLeftButton}
                    onClick={e => navigate('/manager/product-pillow/list') }
                >
                    枕頭商品
                </button>
                <button className={style.MenuLeftButton}>
                    訂單管理
                </button>
                <button className={style.MenuLeftButton}
                    onClick={e => navigate('/manager/customer/list') }
                >
                    客戶管理
                </button>
                <button className={style.MenuLeftButton}
                    onClick={e => navigate('/manager/payment/list') }
                >
                    方案管理
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
        </>
    )
}

export default MenuLeft;

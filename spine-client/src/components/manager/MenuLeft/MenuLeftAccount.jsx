import React, {useState, useEffect} from "react";
import style from './MenuLeft.module.css'
import { useNavigate } from 'react-router-dom';


function MenuLeftAccount() {
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
        </>
    )
}

export default MenuLeftAccount;

import React, { useState, useEffect } from "react";
import style from './ManagerLayout.module.css'
import MenuLeft from "../components/manager/MenuLeft/MenuLeft";
import Header from "../components/Header/Header";
import { Outlet } from 'react-router-dom';

function ManagerLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuHidden, setIsMenuHidden] = useState(false); // 大螢幕時的收合狀態

    const toggleMenu = () => {
        if (window.innerWidth > 800) {
            // 大螢幕：切換收合狀態
            setIsMenuHidden(!isMenuHidden);
        } else {
            // 小螢幕：切換滑出狀態
            setIsMenuOpen(!isMenuOpen);
        }
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // 監聽螢幕尺寸變化
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 800) {
                setIsMenuOpen(false); // 重置小螢幕狀態
            } else {
                setIsMenuHidden(false); // 重置大螢幕狀態
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={style.managerLayout}>
            <Header onToggleMenu={toggleMenu} />
            <MenuLeft isOpen={isMenuOpen} isHidden={isMenuHidden} onClose={closeMenu} />
            <main className={`${style.managerMain} ${isMenuHidden ? style.menuHidden : ''}`}>
                <Outlet />
            </main>
        </div>
    )
}

export default ManagerLayout;

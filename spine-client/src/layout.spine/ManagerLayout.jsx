import React, { useState } from "react";
import style from './ManagerLayout.module.css'
import MenuLeft from "../components.spine/manager/MenuLeft/MenuLeft";
import Header from "../components.spine/Header/Header";
import { Outlet } from 'react-router-dom';

function ManagerLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <div className={style.managerLayout}>
            <Header onToggleMenu={toggleMenu} />
            <MenuLeft isOpen={isMenuOpen} onClose={closeMenu} />
            <main className={style.managerMain}>
                <Outlet />
            </main>
        </div>
    )
}

export default ManagerLayout;

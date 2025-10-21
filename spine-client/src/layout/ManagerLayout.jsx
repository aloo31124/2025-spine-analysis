import React from "react";
import style from './ManagerLayout.module.css'
import MenuLeft from "../components/manager/MenuLeft/MenuLeft";
import { Outlet } from 'react-router-dom';
import { useMenuCollapse } from "../hooks/useMenuCollapse";

function ManagerLayout() {
    const { isCollapsed, isMobile } = useMenuCollapse();
    
    return (
        <div className={style.managerLayout}>
            <MenuLeft />
            <main className={`${style.managerMain} ${isCollapsed && !isMobile ? style.expanded : ''} ${isMobile ? style.fullWidth : ''}`}>
                <Outlet />
            </main>
        </div>
    )
}

export default ManagerLayout;

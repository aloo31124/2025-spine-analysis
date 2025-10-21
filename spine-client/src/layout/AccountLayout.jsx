import React from "react";
import style from './AccountLayout.module.css'
import MenuLeftAccount from "../components/manager/MenuLeft/MenuLeftAccount";
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useMenuCollapse } from "../hooks/useMenuCollapse";

function AccountLayout() {
    const location = useLocation();
    const { isCollapsed, isMobile } = useMenuCollapse();
    const hideMenuPaths = ['/account/payment/select']; // 需要隱藏菜單的路徑

    const shouldShowMenu = !hideMenuPaths.some(path => 
        location.pathname.startsWith(path)
    );

    return (
        <div className={style.AccountLayout}>
            {shouldShowMenu && <MenuLeftAccount />}
            <main className={`${style.AccountMain} ${isCollapsed && !isMobile ? style.expanded : ''} ${isMobile ? style.fullWidth : ''}`}>
                <Outlet />
            </main>
        </div>
    )
}

export default AccountLayout;
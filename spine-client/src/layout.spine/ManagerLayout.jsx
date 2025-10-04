import React from "react";
import style from './ManagerLayout.module.css'
import MenuLeft from "../components.spine/manager/MenuLeft/MenuLeft";
import { Outlet } from 'react-router-dom';

function ManagerLayout() {
    return (
        <div className={style.managerLayout}>
            <MenuLeft />
            <main className={style.managerMain}>
                <Outlet />
            </main>
        </div>
    )
}

export default ManagerLayout;

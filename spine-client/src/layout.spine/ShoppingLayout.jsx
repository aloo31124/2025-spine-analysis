import React, {useState} from "react";
import style from './ShoppingLayout.module.css'
import {Outlet} from "react-router-dom";
import Header from "../components.spine/Header/Header";
import SocialIconBar from "../components/shopping/SocialIconBar/SocialIconBar";

function ShoppingLayout() {
    return (
        <div className={style.shoppingLayout}>
            <Header />
            <main className={style.shoppingMain}>
                <Outlet />
            </main>
            <SocialIconBar />
        </div>
    )
}

export default ShoppingLayout;

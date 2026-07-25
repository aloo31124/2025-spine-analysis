import React, {useState} from "react";
import style from './ShoppingLayout.module.css'
import {Outlet} from "react-router-dom";
import SocialIconBar from "../components/shopping/SocialIconBar/SocialIconBar";

function ShoppingLayout() {
    return (
        <div className={style.shoppingLayout}>
            <Outlet />
            <SocialIconBar />
        </div>
    )
}

export default ShoppingLayout;

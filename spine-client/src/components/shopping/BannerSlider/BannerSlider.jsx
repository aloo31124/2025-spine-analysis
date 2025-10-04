import React, {useState} from "react";
import style from './BannerSlider.module.css'
import shoppingBagImg from '../../../assets/img/shoppingBag1.png';
import { useNavigate, useParams } from 'react-router-dom';

function BannerSlider() {
    // 路由
    const navigate = useNavigate();
    
    /* 編輯商品, 更新編輯商品 */
    const clickProductList = async (product) => {
        try {
            alert("進入商品搜尋列表")
            navigate('/shopping/product/search/list/');
        } catch (error) {
            alert('進入商品搜尋列表 失敗:', error);
        }
    }
        
    return (
        <div className={style.bannerSlider}
            onClick={clickProductList}>
            <img className={style.bannerSliderRight}
                src={shoppingBagImg} 
            />
            <div className={style.bannerSliderLeft}>
                <h1>商品介紹區</h1>
            </div>
        </div>
    )
}

export default BannerSlider;

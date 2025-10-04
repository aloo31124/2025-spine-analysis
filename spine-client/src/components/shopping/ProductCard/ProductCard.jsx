import React, {useState} from 'react';
import style from './ProductCard.module.css';
import shoppingBag2Img from '../../../assets/img/shoppingBag2.png';

function ProductCard({imgList = [], name, price, type, onClick}) {
    return (
        <div className={style.ProductCard} onClick={onClick}>
            <div className={style.ProductCardImgContainer}>
                <img className={style.ProductCardImg}
                    src={imgList[0]?.imgUrl || shoppingBag2Img}  
                />
            </div>
            <div className={style.ProductCardInfoContainer}>
                <h3>{name}</h3>
                <div>$ {price}</div>
                <div className='tabItem'>{type}</div>
            </div>
        </div>
    );
}

export default ProductCard;

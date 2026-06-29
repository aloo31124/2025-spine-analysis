import React, {useEffect, useState} from 'react';
import style from './ProductList.module.css';
import ProductCard from '../ProductCard/ProductCard';

function ProductList({prductList, selectProduct}) {

    return (
        <div className={style.ProductList}>
            {
                prductList.map(product => {
                    return <ProductCard 
                                key={product.id}
                                imgList={product.imgList}
                                name={product.name}
                                price={product.price}
                                type={product.categoryName}
                                onClick={() => selectProduct(product)}
                            />
                })
            }
        </div>
    );
}

export default ProductList;

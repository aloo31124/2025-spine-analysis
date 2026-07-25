import React from "react";
import style from "./ProductGalleryDialog.module.css";
import ProductGallery from "../../shopping/ProductGallery/ProductGallery"

function ProductGalleryDialog({ isOpen, onClose }) {
    if (!isOpen) return null; // Dialog 關閉時不渲染

    return (
        <div className={style.mask} onClick={onClose}>
            <div className={style.dialog} onClick={(e) => e.stopPropagation()}>
                <h3>預覽商品櫥窗</h3>
                <ProductGallery />
            </div>
        </div>
    );
}

export default ProductGalleryDialog;


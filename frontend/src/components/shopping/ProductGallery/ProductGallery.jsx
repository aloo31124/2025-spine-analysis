import React, { useRef, useState } from 'react';
import style from './ProductGallery.module.css';
import shoppingBag2Img from '../../../assets/img/shoppingBag2.png';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // 使用 lucide-react 的箭头图标

function ProductGallery() {
    const sliderRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // 左右滾動
    const scroll = (direction) => {
        if (!sliderRef.current) return;
        const scrollAmount = 300; // 每次滾動距離
        sliderRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    };

    // 開始拖曳
    const handleMouseDown = (e) => {
        if (!sliderRef.current) return;
        e.preventDefault();
        setIsDragging(true);
        setStartX(e.pageX - sliderRef.current.offsetLeft);
        setScrollLeft(sliderRef.current.scrollLeft);
    };

    // 拖曳進行中
    const handleMouseMove = (e) => {
        if (!isDragging || !sliderRef.current) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 2; // 拖动距离调整
        sliderRef.current.scrollLeft = scrollLeft - walk;
    };

    // 結束拖曳
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        
        <div className={style.ProductGalleryWrapper}>
            {/* 左箭頭 */}
            <button className={style.ArrowButton} onClick={() => scroll(-1)}>
                <ChevronLeft size={24} />
            </button>

            
            <img className={style.ProdcutMainImg} src={shoppingBag2Img} />

            {/* 圖片輪播軌道 */}
            <div
                className={style.ProductGallerySlider}
                ref={sliderRef}
                onMouseDown={e => handleMouseDown(e)}
                onMouseMove={e => handleMouseMove(e)}
                onMouseUp={handleMouseUp}
            >

                {Array(10).fill(shoppingBag2Img).map((imgSrc, index) => (
                    <img key={index} className={style.ProductGalleryImg} src={imgSrc} alt="商品图片" />
                ))}
            </div>

            {/* 右箭頭 */}
            <button className={style.ArrowButton} onClick={() => scroll(1)}>
                <ChevronRight size={24} />
            </button>
        </div>
    );
}

export default ProductGallery;

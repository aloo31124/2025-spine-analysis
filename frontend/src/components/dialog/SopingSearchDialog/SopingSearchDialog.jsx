import React, {useEffect, useState} from 'react';
import style from './SopingSearchDialog.module.css';
import dialogStyle from '../dialog.module.css';
import RangeSlider from '../../tools/RangeSlider/RangeSlider';

function SopingSearchDialog({ isOpen, onClose, handleSearchParam, categoryList, promotionList}) {
    /** 分類, 促銷 存入 狀態useState, 用於點選時重新渲染 本元件  */
    const [_categoryList, _setCategoryList] = useState([]);
    const [_promotionList, _setPromotionList] = useState([]);
    const [_priceRange, _setPriceRange] = useState({min:0, max: null});
    // 費用範圍不限制
    const [isPriceRangeLimit, setIsPriceRangeLimit] = useState(true);


    useEffect(() => {
        if (!isOpen) return;
        _setCategoryList(categoryList);
        _setPromotionList(promotionList);
    }, [categoryList, promotionList]);

    const clickMaseToClose = () => {
        saveSearchParam();
        onClose();
    }

    const saveSearchParam = () => {
        handleSearchParam({
            categoryList: _categoryList,
            promotionList: _promotionList,
            priceRange: (isPriceRangeLimit) ? _priceRange : {min:0, max: null}
        });
        onClose();
    }

    const handlePriceRange = (range) => {
        _setPriceRange(range);
    }

    
    if (!isOpen) return null; // Dialog 關閉時不渲染

    return (
        <div className={dialogStyle.mask} onClick={() => clickMaseToClose()}>
            <div className={dialogStyle.dialog} onClick={(e) => e.stopPropagation()} >
                <h2>篩選條件</h2>
                <h3>商品分類</h3>
                <div className={dialogStyle.dialogRow}>
                    <div className={_categoryList.some(c => c.isSelected) ? 'tabItem' : 'tabItemClicked'}
                        onClick={() => _setCategoryList(_categoryList.map(c => ({...c, isSelected: false})))}
                    >
                        不限
                    </div>
                    {_categoryList.map(category => 
                        <div className={category.isSelected ? 'tabItemClicked' : 'tabItem'}
                            key={category.id} 
                            onClick={() => _setCategoryList(_categoryList.map(c => (c.id === category.id ? {...c, isSelected: !c.isSelected} : c )))}
                        >
                            {category.name}
                        </div>
                    )}
                </div>

                <h3>商品價位</h3>
                <div className={dialogStyle.dialogRow}>
                    <div className={isPriceRangeLimit ? 'tabItem' : 'tabItemClicked'}
                        onClick={() => setIsPriceRangeLimit(!isPriceRangeLimit)}
                    >
                        價位不限
                    </div>
                </div>
                {isPriceRangeLimit && (
                    <RangeSlider
                        maxDefault={500}
                        maxLimit={2000}
                        _setRange={handlePriceRange}
                    />
                )}

                <h3>方案優惠</h3>
                <div className={dialogStyle.dialogRow}>
                    <div className={_promotionList.some(p => p.isSelected) ? 'tabItem' : 'tabItemClicked'}
                        onClick={() => _setPromotionList(_promotionList.map(p => ({...p, isSelected: false})) )}
                    >
                        不限
                    </div>
                    {_promotionList.map(promotion => 
                        <div className={promotion.isSelected ? 'tabItemClicked' : 'tabItem'} 
                            key={promotion.id}
                            onClick={() => _setPromotionList(_promotionList.map(p => (p.id === promotion.id ? {...p, isSelected: !p.isSelected} : p) ))}
                        >
                            {promotion.name}
                        </div>
                    )}
                </div>
                <div className={dialogStyle.dialogFoot}>
                    <button onClick={() => saveSearchParam()}>確定</button>
                </div>
            </div>
        </div>
    );    
}
export default SopingSearchDialog;

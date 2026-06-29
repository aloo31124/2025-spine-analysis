import React, {useEffect, useState} from 'react';
import filterIcon from "../../../assets/icon/filter.svg";
import style from './ProductSearchBar.module.css'

function ProductSearchBar({clickShowSearchDialog, searchParam, handleSearchParam, setSearchParam}) {
    /** 分類, 促銷 存入 狀態useState, 用於點選時重新渲染 本元件  */
    const [_categoryList, _setCategoryList] = useState([]);
    const [_promotionList, _setPromotionList] = useState([]);

    useEffect(() => {
        _setCategoryList(searchParam.categoryList.filter(c => c.isSelected));
        _setPromotionList(searchParam.promotionList.filter(p => p.isSelected));
    }, [searchParam]);

    const _handleKeyword = (keyword) => {
        setSearchParam({...searchParam, keyword});
    }

    const _handleSearchParam = (e) => {
        e.stopPropagation();
        handleSearchParam();
    }

    return (
        <div className={style.ProductSearchBar} >
            <input type="text" 
                placeholder='輸入搜尋商品'
                value={searchParam.keyword}
                onChange={(e) => _handleKeyword(e.target.value)}
            />
            <div className={style.ProductSearchItemList} onClick={clickShowSearchDialog}>
                <img src={filterIcon} className={style.filterIcon} />
                
                {
                    _categoryList?.length === 0 ? 
                    <div className='tabItem'>分類不限</div>
                    : _categoryList.map(c => (<div className='tabItem'>{c.name}</div>))
                }

                {
                    searchParam?.priceRange?.max ?
                    <div className='tabItem'>
                        {searchParam.priceRange.min || 0} ~ {searchParam.priceRange.max}
                    </div>
                    : <div className='tabItem'>價位不限</div>
                }

                {
                    _promotionList?.length === 0 ? 
                    <div className='tabItem'>優惠不限</div>
                    : _promotionList.map(p => (<div className='tabItem'>{p.name}</div>))
                }

                <button onClick={(e) => _handleSearchParam(e)}>搜尋</button>
            </div>
        </div>
    );
}

export default ProductSearchBar;

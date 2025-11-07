import React, {useState} from "react";
import style from "../../../pages/manager/manager.module.css";
import {searchProductCategory} from '../../../api/manager/product-category';

function SearchBarCategory({getSearchResult}) {
    // 商品名稱
    const [name, setName] = useState(null);

    // 搜尋商品類別
    const clickSearchProductCategory = async () => {
        const res = await searchProductCategory({searchParam: {name}});
        getSearchResult(res.data.searchResult);
    }

    return (
        <div className={style.SearchBarContainer}>
            <div className={style.SearchBarRow}>
                <input type="text" 
                    placeholder="商品類別不限"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <button onClick={clickSearchProductCategory}>搜尋</button>
            </div>
        </div>
    );
}
export default SearchBarCategory;

import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import style from "./ShopSearchListPage.module.css"
import ProductSearchBar from "../../components/shopping/ProductSearchBar/ProductSearchBar";
import ProductList from "../../components/shopping/ProductList/ProductList";
import PaggingBar from '../../components/PaggingBar/PaggingBar';
import PaginationBar from '../../components/tools/PaginationBar/PaginationBar'
import {searchProductList, getProductCategoryList, getPromotionList} from '../../api/shopping/shopProduct';
import SopingSearchDialog from '../../components/dialog/SopingSearchDialog/SopingSearchDialog';

// 商品搜尋列表
function ShopSearchListPage() {
    const navigate = useNavigate();
    /** 初始載入資料 */
    const [prductList, setProductList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [promotionList, setPromotionList] = useState([]);
    const [showSearchDialog, setShowSearchDialog] = useState(false);
    /** 搜尋參數 */
    const [searchParam, setSearchParam] = useState({keyword: "", categoryList:[], promotionList:[], priceRange: {min: 0, max: 5000}});
    const [pagingParam, setPagingParam] = useState({pageIndex:1, pageSize: 9, sort:'', pageTotal:-1, dataTotal:-1});


    useEffect(() => {
        fetchProductList();
        fetchCategory();
        fetchPromotion();
    }, []);

    const clickSearchProductList = () => {
        fetchProductList();
    }

    const fetchProductList = () => {
        searchProductList(searchParam, pagingParam).then((res) => {
            setProductList(res.data.result.productList);
            setPagingParam(res.data.result.pagingParam);
        }).catch(err => {
            console.log("取得購物商品列表錯誤: ", err)
        });
    }

    const fetchCategory = async () => {
        const res = await getProductCategoryList();
        if(res?.status !== 200) {
            alert("載入商品分類異常。");
        }
        setCategoryList(res.data.result.map(c => ({...c, isSelected: false})));
    }

    const fetchPromotion = async () => {
        const res = await getPromotionList();
        if(res?.status !== 200) {
            alert("載入促銷優惠異常。");
        }
        setPromotionList(res.data.result.map(p => ({...p, isSelected: false})));
    }

    const _setSearchParam = (_searchParam) => {
        setSearchParam(_searchParam);
        setCategoryList(_searchParam.categoryList);
        setPromotionList(_searchParam.promotionList);
    }
    
    // 切換每頁顯示筆數
    const handlePageSizeChange = async (event) => {
        const newSize = parseInt(event.target.value, 10);
        const res = await searchProductList(searchParam, { ...pagingParam, pageSize: newSize, pageIndex: 1 });
        setProductList(res.data.result.productList);
        setPagingParam({ ...pagingParam, pageSize: newSize, pageIndex: 1 }); // 變更 pageSize 時，重置 pageIndex
    };
    // 分頁切換處理
    const handlePageChange = async (pageIndex) => {
        if (pageIndex < 1 || pageIndex > pageIndex) return;
        const res = await searchProductList(searchParam, {...pagingParam, pageIndex});
        setProductList(res.data.result.productList);
        setPagingParam({...pagingParam, pageIndex});
    };

    const handleSelectProduct = (product) => {
        navigate(`/shopping/product/content`);
    }

    return (
        <div className={style.ShopSearchListPage}>
            <ProductSearchBar 
                clickShowSearchDialog={() => setShowSearchDialog(true)}
                setSearchParam={_setSearchParam}
                searchParam={searchParam}
                handleSearchParam={() => clickSearchProductList()}
            />
            <ProductList 
                prductList={prductList}
                selectProduct={handleSelectProduct}
            />
            
            <PaginationBar 
                pagingParam={pagingParam} 
                clickPageChange={handlePageChange} 
                clickPageSizeChange={handlePageSizeChange}
                isShowPotalSetting={false}
            />

            {/** [篩選條件] 視窗 */}
            {showSearchDialog && (
                <SopingSearchDialog 
                    isOpen={showSearchDialog}
                    onClose={() => setShowSearchDialog(false)}
                    handleSearchParam={_setSearchParam}
                    categoryList={categoryList}
                    promotionList={promotionList}
                />
            )}
        </div>
    )
}

export default ShopSearchListPage;

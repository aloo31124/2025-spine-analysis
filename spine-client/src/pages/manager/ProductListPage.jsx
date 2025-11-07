import React, {useEffect, useState} from 'react';
import { withLoading } from '../../utils/loading';
import SearchBarProduct from '../../components/manager/SearchBar/SearchBarProduct';
import TopBtnBarProduct from '../../components/manager/TopBtnBar/TopBtnBarProduct';
import {useNavigate} from 'react-router-dom';
import {getProductList, getProductCategoryList, deleteProduct, searchProduct} from '../../api/manager/product';
import PaginationBar from '../../components/tools/PaginationBar/PaginationBar'
import shoppingBag2Img from '../../assets/img/shoppingBag2.png';
import loadingGif from '../../assets/loading.gif';
import style from './manager.module.css';

function ProductListPage() {
    const navigate = useNavigate();
    const [productList, setProductList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [pagingParam, setPagingParam] = useState({ pageIndex: 1, pageSize: 5, sort: 'keyword', pageTotal:-1, dataTotal:-1 });
    const [searchParam, setSearchParam] = useState({keyword:'', state:'', createDate:'', categoryList, priceMin:0, priceMax:0});
    const [isLoading, setIsLoading] = useState(false);

    // 初始時, 取得商品列表
    useEffect(() => {
        fetchProductList();
        fetchCategory();
    }, []);

    const fetchProductList = async () => {
        await withLoading(
            getProductList(searchParam, pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setProductList(res.data.result.productList);
            setPagingParam(res.data.result.pagingParam);
        }).catch(e => {
            if (e.message !== 'timeout') console.log('取得商品列表發生錯誤', e);
        });
    }

    const fetchCategory = async () => {
        const res = await getProductCategoryList();
        if(res?.status !== 200) {
            alert("載入商品分類異常。");
        }
        setCategoryList(res.data.result.map(c => ({...c, isSelected: false})));
    }


    // 切換每頁顯示筆數
    const handlePageSizeChange = async (event) => {
        const newSize = parseInt(event.target.value, 10);
        const res = await searchProduct(searchParam, { ...pagingParam, pageSize: newSize, pageIndex: 1 });
        setProductList(res.data.searchResult.productList);
        setPagingParam({ ...pagingParam, pageSize: newSize, pageIndex: 1 }); // 變更 pageSize 時，重置 pageIndex
    };
    // 分頁切換處理
    const handlePageChange = async (pageIndex) => {
        if (pageIndex < 1 || pageIndex > pageIndex) return;
        await withLoading(
            searchProduct(searchParam, {...pagingParam, pageIndex}),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setProductList(res.data.searchResult.productList);
            setPagingParam({...pagingParam, pageIndex});
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩, 請重新搜尋');
        });
    };

    // 編輯商品
    const handleEditProduct = (product) => {
        navigate(`/manager/product/edit/${product.id}`,{ state: { product, categoryList }});
    }

    // 搜尋商品結果, 重新渲染商品
    const handleSearchResult = async (_searchParam) => {
        let _pagingParam = { ...pagingParam, pageIndex: 1 }; // 重置頁碼
        await withLoading(
            searchProduct(_searchParam, _pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setSearchParam(_searchParam);
            setProductList(res.data.searchResult.productList);
            setPagingParam(res.data.searchResult.pagingParam);
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩, 請重新搜尋');
        });
    }

    // 刪除商品
    const handleDeleteProduct = (productId) => {
        if(!window.confirm('確定要刪除此商品?')) return;
        deleteProduct(productId).then((res) => {
            alert('刪除商品成功');
            const newProductList = productList.filter((product) => product.id !== productId);
            setProductList(newProductList);
        }).catch((error) => {
            console.log('刪除商品發生錯誤', error);
        });
    }

    return (
        <div className={style.ManagerPage}>
            <TopBtnBarProduct 
                categoryList={categoryList}
                productList={productList}
            />
            <SearchBarProduct 
                getSearchParam={handleSearchResult}
                categoryList={categoryList}
                pagingParam={pagingParam}
            />
            <div className={style.TableContainer}>
                {isLoading ? (
                    <div className={style.LoadingContainer}>
                        <img src={loadingGif} alt="Loading..." />
                    </div>
                ) : (
                    <table className={style.ManagerTable}>
                        <thead>
                            <tr>
                                <th>圖片</th>
                                <th>名稱</th>
                                <th>分類</th>
                                <th>價格</th>
                                <th>狀態</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className={style.NoData}>查無資料</td>
                                </tr>
                            ) : (
                                productList.map((product) => {
                                    return (
                                        <tr key={product.id}>
                                            <td data-label="圖片"><img className={style.ProductImage} src={product.imgList[0]?.imgUrl || shoppingBag2Img} alt="商品圖片" /></td>
                                            <td data-label="名稱" className={style.ItemName}>{product.name}</td>
                                            <td data-label="分類">{categoryList.find(c => c.id === product.categoryId)?.name}</td>
                                            <td data-label="價格" className={style.ItemCost}>{product.price}</td>
                                            <td data-label="狀態">{product.state}</td>
                                            <td data-label="操作" className={style.ActionButtons}>
                                                <button onClick={() => handleEditProduct(product)}>編輯</button>
                                                <button onClick={() => handleDeleteProduct(product.id)}>刪除</button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            <PaginationBar 
                pagingParam={pagingParam} 
                clickPageChange={handlePageChange} 
                clickPageSizeChange={handlePageSizeChange}
            />
        </div>
    );
}

export default ProductListPage;
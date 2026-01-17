import React, {useEffect, useState} from 'react';
import { withLoading } from '../../utils/loading';
import SearchBarProduct from '../../components/manager/SearchBar/SearchBarProduct';
import TopBtnBarProduct from '../../components/manager/TopBtnBar/TopBtnBarProduct';
import {useNavigate} from 'react-router-dom';
import {getProductList, getProductCategoryList, deleteProduct, searchProduct} from '../../api/manager/product';
import PaginationBar from '../../components/tools/PaginationBar/PaginationBar'
import shoppingBag2Img from '../../assets/img/shoppingBag2.png';
import loadingGif from '../../assets/loading.gif';
import styles from './ProductListPage.module.css';

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

    // 取得商品狀態樣式
    const getStatusClass = (state) => {
        switch (state) {
            case '上架':
            case '正常':
                return `${styles.productStatus} ${styles.statusActive}`;
            case '草稿':
                return `${styles.productStatus} ${styles.statusDraft}`;
            case '下架':
            case '停用':
                return `${styles.productStatus} ${styles.statusInactive}`;
            default:
                return styles.productStatus;
        }
    };

    // 渲染桌面版表格
    const renderDesktopTable = () => (
        <table className={styles.productTable}>
            <thead>
                <tr>
                    <th>商品圖片</th>
                    <th>商品名稱</th>
                    <th>分類</th>
                    <th>價格</th>
                    <th>狀態</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan="6" className={styles.loadingContainer}>
                            <img src={loadingGif} alt="Loading..." />
                        </td>
                    </tr>
                ) : productList.length === 0 ? (
                    <tr>
                        <td colSpan="6" className={styles.emptyState}>
                            查無資料
                        </td>
                    </tr>
                ) : (
                    productList.map((product) => (
                        <tr key={product.id}>
                            <td>
                                <img 
                                    className={styles.productImage}
                                    src={product.imgList[0]?.imgUrl || shoppingBag2Img} 
                                    alt={product.name}
                                />
                            </td>
                            <td>
                                <div className={styles.productName}>
                                    {product.name}
                                </div>
                            </td>
                            <td>
                                {categoryList.find(c => c.id === product.categoryId)?.name || '未分類'}
                            </td>
                            <td>
                                <div className={styles.productPrice}>
                                    NT$ {product.price?.toLocaleString()}
                                </div>
                            </td>
                            <td>
                                <span className={getStatusClass(product.state)}>
                                    {product.state}
                                </span>
                            </td>
                            <td>
                                <div className={styles.actionButtons}>
                                    <button 
                                        className={`${styles.actionButton} ${styles.edit}`}
                                        onClick={() => handleEditProduct(product)}
                                    >
                                        編輯
                                    </button>
                                    <button 
                                        className={`${styles.actionButton} ${styles.delete}`}
                                        onClick={() => handleDeleteProduct(product.id)}
                                    >
                                        刪除
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );

    // 渲染手機版卡片
    const renderMobileCards = () => (
        <div className={styles.mobileCardContainer}>
            {isLoading ? (
                <div className={styles.loadingContainer}>
                    <img src={loadingGif} alt="Loading..." />
                </div>
            ) : productList.length === 0 ? (
                <div className={styles.emptyState}>
                    查無資料
                </div>
            ) : (
                productList.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                        <div className={styles.cardHeader}>
                            <img 
                                className={styles.cardImage}
                                src={product.imgList[0]?.imgUrl || shoppingBag2Img} 
                                alt={product.name}
                            />
                            <div className={styles.cardTitle}>
                                {product.name}
                            </div>
                        </div>
                        
                        <div className={styles.cardBody}>
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>分類：</span>
                                <span className={styles.cardValue}>
                                    {categoryList.find(c => c.id === product.categoryId)?.name || '未分類'}
                                </span>
                            </div>
                            
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>價格：</span>
                                <span className={`${styles.cardValue} ${styles.productPrice}`}>
                                    NT$ {product.price?.toLocaleString()}
                                </span>
                            </div>
                            
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>狀態：</span>
                                <span className={getStatusClass(product.state)}>
                                    {product.state}
                                </span>
                            </div>
                        </div>
                        
                        <div className={styles.cardActions}>
                            <button 
                                className={`${styles.cardButton} ${styles.edit}`}
                                onClick={() => handleEditProduct(product)}
                            >
                                編輯
                            </button>
                            <button 
                                className={`${styles.cardButton} ${styles.delete}`}
                                onClick={() => handleDeleteProduct(product.id)}
                            >
                                刪除
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className={styles.productListContainer}>
            <TopBtnBarProduct 
                categoryList={categoryList}
                productList={productList}
            />
            <SearchBarProduct 
                getSearchParam={handleSearchResult}
                categoryList={categoryList}
                pagingParam={pagingParam}
            />
            
            {/* 桌面版表格 */}
            {renderDesktopTable()}
            
            {/* 手機版卡片 */}
            {renderMobileCards()}
            
            <PaginationBar 
                pagingParam={pagingParam} 
                clickPageChange={handlePageChange} 
                clickPageSizeChange={handlePageSizeChange}
            />
        </div>
    );
}

export default ProductListPage;
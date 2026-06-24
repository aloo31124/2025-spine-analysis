import React, { useEffect, useState } from 'react';
import { withLoading } from '../../utils/loading';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProductMattressList, deleteProductMattress, searchProductMattress } from '../../api/manager/productMattress';
import PaginationBar from '../../components/tools/PaginationBar/PaginationBar';
import loadingGif from '../../assets/loading.gif';
import styles from './ProductListPage.module.css';

/**
 * 床墊商品列表頁面
 * 參考 ProductPillowListPage，專門管理床墊商品
 */
function ProductMattressListPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialKeyword = searchParams.get('keyword') || ''; // 來自上方搜尋bar的關鍵字
    const [productMattressList, setProductMattressList] = useState([]);
    const [pagingParam, setPagingParam] = useState({ 
        pageIndex: 1, 
        pageSize: parseInt(localStorage.getItem('mattressListPageSize')) || 10, 
        sort: 'createdAt', 
        pageTotal: -1, 
        dataTotal: -1 
    });
    const [searchParam, setSearchParam] = useState({
        keyword: initialKeyword,
        model: '',
        stateList: [],  // 狀態多選
        priceMin: '', priceMax: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    // 狀態選項
    const stateOptions = ['草稿', '上架', '下架'];
    
    // 床墊型號選項
    const mattressModelOptions = [
        '1號床墊',
        '2號床墊',
        '3號床墊',
        '4號床墊',
        '1+1號床墊(1號床墊加厚1公分)'
    ];

    // 初始載入 / 上方搜尋bar 帶入的關鍵字變動時, 依關鍵字搜尋床墊商品
    useEffect(() => {
        const kw = searchParams.get('keyword') || '';
        handleSearchResult({ ...searchParam, keyword: kw });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const fetchProductMattressList = async () => {
        await withLoading(
            getProductMattressList(searchParam, pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setProductMattressList(res.data.result?.productMattressList || []);
            setPagingParam(res.data.result?.pagingParam || pagingParam);
        }).catch(e => {
            console.error('取得床墊商品列表失敗:', e);
        });
    }

    // 切換每頁顯示筆數
    const handlePageSizeChange = async (event) => {
        const newSize = parseInt(event.target.value, 10);
        localStorage.setItem('mattressListPageSize', newSize);
        const res = await searchProductMattress(searchParam, { ...pagingParam, pageSize: newSize, pageIndex: 1 });
        setProductMattressList(res.data.searchResult?.productMattressList || []);
        setPagingParam({ ...pagingParam, pageSize: newSize, pageIndex: 1 });
    };

    // 分頁切換處理
    const handlePageChange = async (pageIndex) => {
        if (pageIndex < 1 || pageIndex > pagingParam.pageTotal) return;
        await withLoading(
            searchProductMattress(searchParam, { ...pagingParam, pageIndex }),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setProductMattressList(res.data.searchResult?.productMattressList || []);
            setPagingParam(res.data.searchResult?.pagingParam || pagingParam);
        }).catch(e => {
            console.error('切換分頁失敗:', e);
        });
    };

    // 編輯床墊商品
    const handleEditProductMattress = (productMattress) => {
        navigate(`/manager/product-mattress/edit/${productMattress.id}`, { state: { productMattress } });
    }

    // 搜尋床墊商品結果
    const handleSearchResult = async (_searchParam) => {
        let _pagingParam = { ...pagingParam, pageIndex: 1 };
        await withLoading(
            searchProductMattress(_searchParam, _pagingParam),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setProductMattressList(res.data.searchResult?.productMattressList || []);
            setPagingParam(res.data.searchResult?.pagingParam || pagingParam);
        }).catch(e => {
            console.error('搜尋床墊商品失敗:', e);
        });
    }

    // 刪除床墊商品
    const handleDeleteProductMattress = (productMattressId) => {
        if (window.confirm('確定要刪除此床墊商品嗎？')) {
            deleteProductMattress(productMattressId).then(() => {
                alert('刪除成功');
                fetchProductMattressList();
            }).catch(e => {
                console.error('刪除床墊商品失敗:', e);
                alert('刪除失敗');
            });
        }
    }

    // 處理狀態多選變更
    const handleStateChange = (state) => {
        setSearchParam(prev => {
            const newStateList = prev.stateList.includes(state)
                ? prev.stateList.filter(s => s !== state)
                : [...prev.stateList, state];
            return { ...prev, stateList: newStateList };
        });
    }

    // 清除搜尋條件
    const handleClearSearch = () => {
        setSearchParam({
            keyword: '',
            model: '',
            stateList: [],
            priceMin: '', priceMax: ''
        });
        fetchProductMattressList();
    }

    // 渲染範圍輸入元件
    const renderRangeInput = (label, minKey, maxKey, unit = '') => (
        <div className={styles.rangeInputGroup}>
            <label>{label}：</label>
            <input
                type="number"
                placeholder="最小"
                value={searchParam[minKey]}
                onChange={(e) => setSearchParam({ ...searchParam, [minKey]: e.target.value })}
                className={styles.rangeInput}
            />
            <span>~</span>
            <input
                type="number"
                placeholder="最大"
                value={searchParam[maxKey]}
                onChange={(e) => setSearchParam({ ...searchParam, [maxKey]: e.target.value })}
                className={styles.rangeInput}
            />
            {unit && <span className={styles.unit}>{unit}</span>}
        </div>
    );

    // 取得商品狀態樣式
    const getStatusClass = (state) => {
        switch(state) {
            case '上架':
                return `${styles.status} ${styles.statusActive}`;
            case '下架':
                return `${styles.status} ${styles.statusInactive}`;
            case '草稿':
                return `${styles.status} ${styles.statusDraft}`;
            default:
                return styles.status;
        }
    };

    // 渲染桌面版表格
    const renderDesktopTable = () => (
        <table className={styles.productTable}>
            <thead>
                <tr>
                    <th>名稱</th>
                    <th>型號</th>
                    <th>價格</th>
                    <th>創建者</th>
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
                ) : productMattressList.length === 0 ? (
                    <tr>
                        <td colSpan="6" className={styles.emptyState}>
                            查無資料
                        </td>
                    </tr>
                ) : (
                    productMattressList.map((productMattress) => (
                        <tr key={productMattress.id}>
                            <td>
                                <div className={styles.productName}>
                                    {productMattress.name}
                                </div>
                            </td>
                            <td>{productMattress.model || '-'}</td>
                            <td>
                                <div className={styles.productPrice}>
                                    NT$ {productMattress.price?.toLocaleString()}
                                </div>
                            </td>
                            <td>
                                <div className={styles.creatorName} title={productMattress.creatorEmail || ''}>
                                    {productMattress.creatorName || '-'}
                                </div>
                            </td>
                            <td>
                                <div className={styles.actionButtons}>
                                    <button
                                        className={`${styles.actionButton} ${styles.edit}`}
                                        onClick={() => handleEditProductMattress(productMattress)}
                                    >
                                        編輯
                                    </button>
                                    <button
                                        className={`${styles.actionButton} ${styles.delete}`}
                                        onClick={() => handleDeleteProductMattress(productMattress.id)}
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
            ) : productMattressList.length === 0 ? (
                <div className={styles.emptyState}>
                    查無資料
                </div>
            ) : (
                productMattressList.map((productMattress) => (
                    <div key={productMattress.id} className={styles.productCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>
                                {productMattress.name}
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>型號：</span>
                                <span className={styles.cardValue}>{productMattress.model || '-'}</span>
                            </div>

                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>價格：</span>
                                <span className={`${styles.cardValue} ${styles.productPrice}`}>
                                    NT$ {productMattress.price?.toLocaleString()}
                                </span>
                            </div>

                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>狀態：</span>
                                <span className={getStatusClass(productMattress.state)}>
                                    {productMattress.state}
                                </span>
                            </div>

                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>創建者：</span>
                                <span className={styles.cardValue}>
                                    {productMattress.creatorName || '-'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.cardActions}>
                            <button
                                className={`${styles.cardButton} ${styles.edit}`}
                                onClick={() => handleEditProductMattress(productMattress)}
                            >
                                編輯
                            </button>
                            <button
                                className={`${styles.cardButton} ${styles.delete}`}
                                onClick={() => handleDeleteProductMattress(productMattress.id)}
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
            {/* 頂部按鈕列 */}
            <div className={styles.topBtnBar}>
                <button
                    className={styles.addButton}
                    onClick={() => navigate('/manager/product-mattress/add')}
                >
                    新增床墊商品
                </button>
            </div>

            {/* 搜尋列 */}
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="搜尋床墊商品名稱..."
                    value={searchParam.keyword}
                    onChange={(e) => setSearchParam({ ...searchParam, keyword: e.target.value })}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchResult(searchParam);
                    }}
                />
                <select
                    value={searchParam.model}
                    onChange={(e) => setSearchParam({ ...searchParam, model: e.target.value })}
                    className={styles.typeInput}
                >
                    <option value="">全部型號</option>
                    {mattressModelOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <button onClick={() => handleSearchResult(searchParam)}>搜尋</button>
                <button 
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className={styles.advancedToggle}
                >
                    {showAdvancedSearch ? '收起進階' : '進階搜尋'}
                </button>
                <button onClick={handleClearSearch} className={styles.clearButton}>清除</button>
            </div>

            {/* 進階搜尋區 */}
            {showAdvancedSearch && (
                <div className={styles.advancedSearchBar}>

                    {/* 價格範圍搜尋 */}
                    <div className={styles.rangeSearchGrid}>
                        {renderRangeInput('價格', 'priceMin', 'priceMax', '元')}
                    </div>
                </div>
            )}

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

export default ProductMattressListPage;

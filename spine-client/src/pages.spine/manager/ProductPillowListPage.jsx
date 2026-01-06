import React, { useEffect, useState } from 'react';
import { withLoading } from '../../utils/loading';
import { useNavigate } from 'react-router-dom';
import { getProductPillowList, deleteProductPillow, searchProductPillow } from '../../api/manager/productPillow';
import PaginationBar from '../../components/tools/PaginationBar/PaginationBar';
import loadingGif from '../../assets/loading.gif';
import styles from './ProductListPage.module.css';
import { PILLOW_MODEL_OPTIONS } from '../../utils/pillowModelOptions';

/**
 * 枕頭商品列表頁面
 * 獨立於 ProductListPage，專門管理枕頭商品
 */
function ProductPillowListPage() {
    const navigate = useNavigate();
    const [productPillowList, setProductPillowList] = useState([]);
    const [pagingParam, setPagingParam] = useState({ pageIndex: 1, pageSize: 5, sort: 'name', pageTotal: -1, dataTotal: -1 });
    const [searchParam, setSearchParam] = useState({ 
        keyword: '', 
        type: '',
        stateList: [],  // 狀態多選
        priceMin: '', priceMax: '',
        shortHeightMin: '', shortHeightMax: '',
        longHeightMin: '', longHeightMax: '',
        shortCurvatureMin: '', shortCurvatureMax: '',
        mediumCurvatureMin: '', mediumCurvatureMax: '',
        longCurvatureMin: '', longCurvatureMax: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    // 狀態選項
    const stateOptions = ['草稿', '上架', '下架'];

    // 初始時, 取得枕頭商品列表
    useEffect(() => {
        fetchProductPillowList();
    }, []);

    const fetchProductPillowList = async () => {
        await withLoading(
            getProductPillowList(searchParam, pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setProductPillowList(res.data.result.productPillowList || []);
            setPagingParam(res.data.result.pagingParam || pagingParam);
        }).catch(e => {
            if (e.message !== 'timeout') console.log('取得枕頭商品列表發生錯誤', e);
        });
    }

    // 切換每頁顯示筆數
    const handlePageSizeChange = async (event) => {
        const newSize = parseInt(event.target.value, 10);
        const res = await searchProductPillow(searchParam, { ...pagingParam, pageSize: newSize, pageIndex: 1 });
        setProductPillowList(res.data.searchResult?.productPillowList || []);
        setPagingParam({ ...pagingParam, pageSize: newSize, pageIndex: 1 });
    };

    // 分頁切換處理
    const handlePageChange = async (pageIndex) => {
        if (pageIndex < 1 || pageIndex > pagingParam.pageTotal) return;
        await withLoading(
            searchProductPillow(searchParam, { ...pagingParam, pageIndex }),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setProductPillowList(res.data.searchResult?.productPillowList || []);
            setPagingParam({ ...pagingParam, pageIndex });
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩, 請重新搜尋');
        });
    };

    // 編輯枕頭商品
    const handleEditProductPillow = (productPillow) => {
        navigate(`/manager/product-pillow/edit/${productPillow.id}`, { state: { productPillow } });
    }

    // 搜尋枕頭商品結果
    const handleSearchResult = async (_searchParam) => {
        let _pagingParam = { ...pagingParam, pageIndex: 1 };
        await withLoading(
            searchProductPillow(_searchParam, _pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setSearchParam(_searchParam);
            setProductPillowList(res.data.searchResult?.productPillowList || []);
            setPagingParam(res.data.searchResult?.pagingParam || _pagingParam);
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩, 請重新搜尋');
        });
    }

    // 刪除枕頭商品
    const handleDeleteProductPillow = (productPillowId) => {
        if (!window.confirm('確定要刪除此枕頭商品?')) return;
        deleteProductPillow(productPillowId).then((res) => {
            alert('刪除枕頭商品成功');
            const newList = productPillowList.filter((p) => p.id !== productPillowId);
            setProductPillowList(newList);
        }).catch((error) => {
            console.log('刪除枕頭商品發生錯誤', error);
        });
    }

    // 處理狀態多選變更
    const handleStateChange = (state) => {
        const currentList = [...searchParam.stateList];
        const index = currentList.indexOf(state);
        if (index > -1) {
            currentList.splice(index, 1);
        } else {
            currentList.push(state);
        }
        setSearchParam({ ...searchParam, stateList: currentList });
    }

    // 清除搜尋條件
    const handleClearSearch = () => {
        setSearchParam({
            keyword: '', 
            type: '',
            stateList: [],
            priceMin: '', priceMax: '',
            shortHeightMin: '', shortHeightMax: '',
            longHeightMin: '', longHeightMax: '',
            shortCurvatureMin: '', shortCurvatureMax: '',
            mediumCurvatureMin: '', mediumCurvatureMax: '',
            longCurvatureMin: '', longCurvatureMax: ''
        });
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
                    <th>名稱</th>
                    <th>枕頭型號</th>
                    <th>價格</th>
                    <th>短高度</th>
                    <th>長高度</th>
                    <th>短弧度</th>
                    <th>中弧度</th>
                    <th>長弧度</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan="10" className={styles.loadingContainer}>
                            <img src={loadingGif} alt="Loading..." />
                        </td>
                    </tr>
                ) : productPillowList.length === 0 ? (
                    <tr>
                        <td colSpan="10" className={styles.emptyState}>
                            查無資料
                        </td>
                    </tr>
                ) : (
                    productPillowList.map((productPillow) => (
                        <tr key={productPillow.id}>
                            <td>
                                <div className={styles.productName}>
                                    {productPillow.name}
                                </div>
                            </td>
                            <td>{productPillow.type || '-'}</td>
                            <td>
                                <div className={styles.productPrice}>
                                    NT$ {productPillow.price?.toLocaleString()}
                                </div>
                            </td>
                            <td>{productPillow.shortHeight} cm</td>
                            <td>{productPillow.longHeight} cm</td>
                            <td>{productPillow.shortCurvature}°</td>
                            <td>{productPillow.mediumCurvature}°</td>
                            <td>{productPillow.longCurvature}°</td>
                            <td>
                                <div className={styles.actionButtons}>
                                    <button
                                        className={`${styles.actionButton} ${styles.edit}`}
                                        onClick={() => handleEditProductPillow(productPillow)}
                                    >
                                        編輯
                                    </button>
                                    <button
                                        className={`${styles.actionButton} ${styles.delete}`}
                                        onClick={() => handleDeleteProductPillow(productPillow.id)}
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
            ) : productPillowList.length === 0 ? (
                <div className={styles.emptyState}>
                    查無資料
                </div>
            ) : (
                productPillowList.map((productPillow) => (
                    <div key={productPillow.id} className={styles.productCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>
                                {productPillow.name}
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>枕頭型號：</span>
                                <span className={styles.cardValue}>{productPillow.type || '-'}</span>
                            </div>

                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>價格：</span>
                                <span className={`${styles.cardValue} ${styles.productPrice}`}>
                                    NT$ {productPillow.price?.toLocaleString()}
                                </span>
                            </div>

                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>高度：</span>
                                <span className={styles.cardValue}>
                                    短 {productPillow.shortHeight}cm / 長 {productPillow.longHeight}cm
                                </span>
                            </div>

                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>弧度：</span>
                                <span className={styles.cardValue}>
                                    短 {productPillow.shortCurvature}° / 中 {productPillow.mediumCurvature}° / 長 {productPillow.longCurvature}°
                                </span>
                            </div>

                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>狀態：</span>
                                <span className={getStatusClass(productPillow.state)}>
                                    {productPillow.state}
                                </span>
                            </div>
                        </div>

                        <div className={styles.cardActions}>
                            <button
                                className={`${styles.cardButton} ${styles.edit}`}
                                onClick={() => handleEditProductPillow(productPillow)}
                            >
                                編輯
                            </button>
                            <button
                                className={`${styles.cardButton} ${styles.delete}`}
                                onClick={() => handleDeleteProductPillow(productPillow.id)}
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
            {/* 頂部按鈕區 */}
            <div className={styles.topBtnBar}>
                <button
                    className={styles.addButton}
                    onClick={() => navigate('/manager/product-pillow/add')}
                >
                    新增枕頭商品
                </button>
            </div>

            {/* 搜尋區域 */}
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="搜尋枕頭商品名稱..."
                    value={searchParam.keyword}
                    onChange={(e) => setSearchParam({ ...searchParam, keyword: e.target.value })}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchResult(searchParam);
                    }}
                />
                <select
                    value={searchParam.type}
                    onChange={(e) => setSearchParam({ ...searchParam, type: e.target.value })}
                    className={styles.typeInput}
                >
                    <option value="">全部枕頭型號</option>
                    {PILLOW_MODEL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
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

            {/* 進階搜尋區域 */}
            {showAdvancedSearch && (
                <div className={styles.advancedSearchBar}>

                    {/* 範圍搜尋 */}
                    <div className={styles.rangeSearchGrid}>
                        {renderRangeInput('價格', 'priceMin', 'priceMax', '元')}
                        {renderRangeInput('短高度', 'shortHeightMin', 'shortHeightMax', 'cm')}
                        {renderRangeInput('長高度', 'longHeightMin', 'longHeightMax', 'cm')}
                        {renderRangeInput('短弧度', 'shortCurvatureMin', 'shortCurvatureMax', '°')}
                        {renderRangeInput('中弧度', 'mediumCurvatureMin', 'mediumCurvatureMax', '°')}
                        {renderRangeInput('長弧度', 'longCurvatureMin', 'longCurvatureMax', '°')}
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

export default ProductPillowListPage;

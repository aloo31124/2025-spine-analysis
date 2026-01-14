import React, {useEffect, useState} from 'react';
import { withLoading } from '../../utils/loading';
import AnalysisResult from '../../components/manager/AnalysisResult/AnalysisResult';
import ProductRecommendationModal from '../../components/manager/ProductRecommendation/ProductRecommendationModal';
import {useNavigate, useLocation} from 'react-router-dom';
import {getProductMattressList, searchProductMattress} from '../../api/manager/productMattress';
import {addMultipleCustomerToProductMattress} from '../../api/manager/customerToProductMattress';
import PaginationBar from '../../components/tools/PaginationBar/PaginationBar'
import loadingGif from '../../assets/loading.gif';
import styles from './ProductListPage.module.css';

/**
 * 床墊商品推薦列表頁面 (含客戶綁定功能)
 * 用於從客戶頁面跳轉過來，選擇床墊商品並綁定給客戶
 */
function ProductMattressRecommendationList() {
    const navigate = useNavigate();
    const location = useLocation();
    const [productMattressList, setProductMattressList] = useState([]);
    const [pagingParam, setPagingParam] = useState({ pageIndex: 1, pageSize: 5, sort: 'name', pageTotal:-1, dataTotal:-1 });
    const [searchParam, setSearchParam] = useState({ 
        keyword: '', 
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
    
    // 客戶相關狀態
    const [customerData, setCustomerData] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const [showAnalysisResults, setShowAnalysisResults] = useState(false);

    // 購買相關狀態
    const [selectedProducts, setSelectedProducts] = useState(new Map()); // Map<productMattressId, {productMattress, quantity, selected}>
    const [isPurchasing, setIsPurchasing] = useState(false);

    // 推薦商品彈窗狀態
    const [showRecommendationModal, setShowRecommendationModal] = useState(false);

    // 初始時, 取得床墊商品列表
    useEffect(() => {
        // 檢查是否從客戶頁面跳轉過來
        if (location.state?.fromCustomerPage && location.state?.customerData) {
            const customer = location.state.customerData;
            setCustomerData(customer);
            setCustomerEmail(customer.email || '');
            setShowAnalysisResults(true);
            
            // 檢查是否有推薦型號，若有則帶入搜尋條件
            if (location.state?.recommendedModel) {
                const recommendedModel = location.state.recommendedModel;
                const newSearchParam = { ...searchParam, model: recommendedModel };
                setSearchParam(newSearchParam);
                // 使用推薦型號進行搜尋
                handleSearchResult(newSearchParam);
            } else {
                fetchProductMattressList();
            }
        } else {
            fetchProductMattressList();
        }
    }, []);

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
            if (e.message !== 'timeout') console.log('取得床墊商品列表發生錯誤', e);
        });
    }


    // 切換每頁顯示筆數
    const handlePageSizeChange = async (event) => {
        const newSize = parseInt(event.target.value, 10);
        const res = await searchProductMattress(searchParam, { ...pagingParam, pageSize: newSize, pageIndex: 1 });
        setProductMattressList(res.data.searchResult?.productMattressList || []);
        setPagingParam({ ...pagingParam, pageSize: newSize, pageIndex: 1 });
    };
    // 分頁切換處理
    const handlePageChange = async (pageIndex) => {
        if (pageIndex < 1 || pageIndex > pagingParam.pageTotal) return;
        await withLoading(
            searchProductMattress(searchParam, {...pagingParam, pageIndex}),
            {
                min: 100,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setProductMattressList(res.data.searchResult?.productMattressList || []);
            setPagingParam({...pagingParam, pageIndex});
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩, 請重新搜尋');
        });
    };

    // 編輯床墊商品
    const handleEditProductMattress = (productMattress) => {
        navigate(`/manager/product-mattress/edit/${productMattress.id}`,{ state: { productMattress }});
    }

    // 搜尋床墊商品結果
    const handleSearchResult = async (_searchParam) => {
        let _pagingParam = { ...pagingParam, pageIndex: 1 };
        await withLoading(
            searchProductMattress(_searchParam, _pagingParam),
            {
                min: 0,
                timeout: 5000,
                onLoading: () => setIsLoading(true),
                onLoaded: () => setIsLoading(false),
                onTimeout: () => alert('網路不穩, 請重新搜尋')
            }
        ).then(res => {
            setSearchParam(_searchParam);
            setProductMattressList(res.data.searchResult?.productMattressList || []);
            setPagingParam(res.data.searchResult?.pagingParam || _pagingParam);
        }).catch(e => {
            if (e.message !== 'timeout') alert('網路不穩, 請重新搜尋');
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
            model: '',
            stateList: [],
            priceMin: '', priceMax: ''
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

    // 處理客戶信箱輸入變更
    const handleCustomerEmailChange = (e) => {
        setCustomerEmail(e.target.value);
    }

    // 切換分析結果顯示/隱藏
    const toggleAnalysisResults = () => {
        setShowAnalysisResults(!showAnalysisResults);
    }

    // 返回客戶管理頁面
    const handleBackToCustomer = () => {
        navigate(-1); // 返回上一頁
    }

    // 處理床墊商品選擇
    const handleProductSelect = (productMattress, checked) => {
        const newSelectedProducts = new Map(selectedProducts);
        if (checked) {
            newSelectedProducts.set(productMattress.id, {
                productMattress: productMattress,
                quantity: 1,
                selected: true
            });
        } else {
            newSelectedProducts.delete(productMattress.id);
        }
        setSelectedProducts(newSelectedProducts);
    }

    // 處理數量變更
    const handleQuantityChange = (productMattressId, quantity) => {
        const newSelectedProducts = new Map(selectedProducts);
        if (newSelectedProducts.has(productMattressId)) {
            const item = newSelectedProducts.get(productMattressId);
            newSelectedProducts.set(productMattressId, {
                ...item,
                quantity: Math.max(1, parseInt(quantity) || 1)
            });
        }
        setSelectedProducts(newSelectedProducts);
    }

    // 處理確認購買
    const handleConfirmPurchase = async () => {
        if (!customerData || !customerData.id) {
            alert('請先選擇客戶');
            return;
        }

        const selectedItems = Array.from(selectedProducts.values()).filter(item => item.selected);
        if (selectedItems.length === 0) {
            alert('請選擇要購買的床墊商品');
            return;
        }

        if (!window.confirm(`確認為客戶 ${customerData.name} 購買 ${selectedItems.length} 項床墊商品？`)) {
            return;
        }

        setIsPurchasing(true);
        try {
            // 準備購買資料
            const customerToProductMattressList = selectedItems.map(item => ({
                customerId: customerData.id,
                productMattressId: item.productMattress.id,
                quantity: item.quantity,
                price: item.productMattress.price,
                purchaseDate: new Date().toISOString(),
                notes: `客戶 ${customerData.name} 購買床墊商品 ${item.productMattress.name}`,
                state: '正常'
            }));

            // 調用 API 批量新增購買紀錄
            const response = await addMultipleCustomerToProductMattress(customerToProductMattressList);
            
            if (response.data.success) {
                alert('購買成功！即將返回客戶管理頁面');
                // 返回客戶管理頁面
                navigate(`/manager/customer/edit/${customerData.id}`, { 
                    state: { 
                        customer: {...customerData}
                    }
                });
            } else {
                alert(`購買失敗：${response.data.message}`);
            }
        } catch (error) {
            console.error('購買失敗：', error);
            alert('購買失敗，請重試');
        } finally {
            setIsPurchasing(false);
        }
    }

    // 計算總金額
    const calculateTotal = () => {
        let total = 0;
        selectedProducts.forEach(item => {
            if (item.selected) {
                total += (item.productMattress.price || 0) * item.quantity;
            }
        });
        return total;
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
                    {customerData && <th>選擇</th>}
                    <th>名稱</th>
                    <th>型號</th>
                    <th>價格</th>
                    <th>狀態</th>
                    {customerData && <th>數量</th>}
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan={customerData ? "7" : "5"} className={styles.loadingContainer}>
                            <img src={loadingGif} alt="Loading..." />
                        </td>
                    </tr>
                ) : productMattressList.length === 0 ? (
                    <tr>
                        <td colSpan={customerData ? "7" : "5"} className={styles.emptyState}>
                            查無資料
                        </td>
                    </tr>
                ) : (
                    productMattressList.map((productMattress) => (
                        <tr key={productMattress.id}>
                            {customerData && (
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.has(productMattress.id)}
                                        onChange={(e) => handleProductSelect(productMattress, e.target.checked)}
                                        className={styles.productCheckbox}
                                    />
                                </td>
                            )}
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
                                <span className={getStatusClass(productMattress.state)}>
                                    {productMattress.state}
                                </span>
                            </td>
                            {customerData && (
                                <td>
                                    <input
                                        type="number"
                                        min="1"
                                        value={selectedProducts.get(productMattress.id)?.quantity || 1}
                                        onChange={(e) => handleQuantityChange(productMattress.id, e.target.value)}
                                        disabled={!selectedProducts.has(productMattress.id)}
                                        className={styles.quantityInput}
                                    />
                                </td>
                            )}
                            <td>
                                <div className={styles.actionButtons}>
                                    <button 
                                        className={`${styles.actionButton} ${styles.edit}`}
                                        onClick={() => handleEditProductMattress(productMattress)}
                                    >
                                        編輯
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
                        {customerData && (
                            <div className={styles.cardCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.has(productMattress.id)}
                                    onChange={(e) => handleProductSelect(productMattress, e.target.checked)}
                                />
                                <label>選擇商品</label>
                            </div>
                        )}
                        
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

                            {customerData && (
                                <div className={styles.cardRow}>
                                    <span className={styles.cardLabel}>數量：</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={selectedProducts.get(productMattress.id)?.quantity || 1}
                                        onChange={(e) => handleQuantityChange(productMattress.id, e.target.value)}
                                        disabled={!selectedProducts.has(productMattress.id)}
                                        className={styles.quantityInput}
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className={styles.cardActions}>
                            <button 
                                className={`${styles.cardButton} ${styles.edit}`}
                                onClick={() => handleEditProductMattress(productMattress)}
                            >
                                編輯
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className={styles.productListContainer}>
            {/* 客戶資訊區塊 */}
            {customerData && (
                <div className={styles.customerInfoSection}>
                    <div className={styles.customerHeader}>
                        <h2>客戶資訊</h2>
                        <button onClick={handleBackToCustomer} className={styles.backButton}>
                            返回客戶管理
                        </button>
                    </div>
                    <div className={styles.customerDetails}>
                        <p><strong>姓名:</strong> {customerData.name}</p>
                        <p><strong>信箱:</strong> {customerData.email}</p>
                        <p><strong>電話:</strong> {customerData.phone}</p>
                        {customerData.address && <p><strong>地址:</strong> {customerData.address}</p>}
                        {customerData.birthday && <p><strong>生日:</strong> {customerData.birthday}</p>}
                        {customerData.gender && <p><strong>性別:</strong> {customerData.gender}</p>}
                        <p><strong>狀態:</strong> {customerData.state}</p>
                        {customerData.notes && <p><strong>備註:</strong> {customerData.notes}</p>}
                    </div>
                </div>
            )}

            <h2>客戶綁定床墊商品</h2>
            <div className={styles.customerBindingSection}>
                <input 
                    type="text" 
                    placeholder='輸入客戶信箱' 
                    value={customerEmail}
                    onChange={handleCustomerEmailChange}
                    className={styles.customerEmailInput}
                />
                {customerData && customerData.analysisResults && customerData.analysisResults.length > 0 && (
                    <button 
                        onClick={toggleAnalysisResults}
                        className={styles.toggleAnalysisButton}
                    >
                        {showAnalysisResults ? '隱藏分析結果' : '顯示分析結果'}
                    </button>
                )}
            </div>
            
            {/* 客戶分析結果區塊 */}
            {customerData && showAnalysisResults && customerData.analysisResults && customerData.analysisResults.length > 0 && (
                <div className={styles.analysisResultsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>客戶分析結果</h2>
                        <button 
                            className={styles.recommendButton}
                            onClick={() => setShowRecommendationModal(true)}
                        >
                            推薦商品
                        </button>
                    </div>
                    <AnalysisResult 
                        analysisResults={customerData.analysisResults}
                        onDeleteResult={null}
                    />
                </div>
            )}
            
            {/* 推薦商品彈窗 */}
            <ProductRecommendationModal
                isOpen={showRecommendationModal}
                onClose={() => setShowRecommendationModal(false)}
                analysisResults={customerData?.analysisResults || []}
            />
            
            {/* 購買確認區域 */}
            {customerData && selectedProducts.size > 0 && (
                <div className={styles.purchaseConfirmSection}>
                    <div className={styles.purchaseHeader}>
                        <h3>購買確認</h3>
                        <div className={styles.purchaseTotal}>
                            總計：NT$ {calculateTotal().toLocaleString()}
                        </div>
                    </div>
                    <div className={styles.selectedItemsList}>
                        {Array.from(selectedProducts.values()).filter(item => item.selected).map(item => (
                            <div key={item.productMattress.id} className={styles.selectedItem}>
                                <span className={styles.itemName}>{item.productMattress.name}</span>
                                <span className={styles.itemQuantity}>x {item.quantity}</span>
                                <span className={styles.itemPrice}>
                                    NT$ {((item.productMattress.price || 0) * item.quantity).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button 
                        className={styles.confirmPurchaseButton}
                        onClick={handleConfirmPurchase}
                        disabled={isPurchasing}
                    >
                        {isPurchasing ? '處理中...' : '確認購買'}
                    </button>
                </div>
            )}

            {/* 搜尋區域 */}
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
                    {mattressModelOptions.map((model) => (
                        <option key={model} value={model}>{model}</option>
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
                    {/* 狀態多選 */}
                    <div className={styles.stateCheckboxGroup}>
                        <label>狀態：</label>
                        {stateOptions.map((state) => (
                            <label key={state} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={searchParam.stateList.includes(state)}
                                    onChange={() => handleStateChange(state)}
                                />
                                {state}
                            </label>
                        ))}
                    </div>

                    {/* 範圍搜尋 */}
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

export default ProductMattressRecommendationList;

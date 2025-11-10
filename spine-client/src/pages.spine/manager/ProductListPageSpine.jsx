import React, {useEffect, useState} from 'react';
import { withLoading } from '../../utils/loading';
import SearchBarProduct from '../../components/manager/SearchBar/SearchBarProduct';
import TopBtnBarProduct from '../../components/manager/TopBtnBar/TopBtnBarProduct';
import AnalysisResult from '../../components/manager/AnalysisResult/AnalysisResult';
import {useNavigate, useLocation} from 'react-router-dom';
import {getProductList, getProductCategoryList, deleteProduct, searchProduct} from '../../api/manager/product';
import {addMultipleCustomerToProduct} from '../../api/manager/customerToProduct';
import PaginationBar from '../../components/tools/PaginationBar/PaginationBar'
import shoppingBag2Img from '../../assets/img/shoppingBag2.png';
import loadingGif from '../../assets/loading.gif';
import styles from './ProductListPage.module.css';

function ProductListPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [productList, setProductList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [pagingParam, setPagingParam] = useState({ pageIndex: 1, pageSize: 5, sort: 'keyword', pageTotal:-1, dataTotal:-1 });
    const [searchParam, setSearchParam] = useState({keyword:'', state:'', createDate:'', categoryList, priceMin:0, priceMax:0});
    const [isLoading, setIsLoading] = useState(false);
    
    // 客戶相關狀態
    const [customerData, setCustomerData] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const [showAnalysisResults, setShowAnalysisResults] = useState(false);

    // 購買相關狀態
    const [selectedProducts, setSelectedProducts] = useState(new Map()); // Map<productId, {product, quantity, selected}>
    const [isPurchasing, setIsPurchasing] = useState(false);

    // 初始時, 取得商品列表
    useEffect(() => {
        fetchProductList();
        fetchCategory();
        
        // 檢查是否從客戶頁面跳轉過來
        if (location.state?.fromCustomerPage && location.state?.customerData) {
            const customer = location.state.customerData;
            setCustomerData(customer);
            setCustomerEmail(customer.email || '');
            setShowAnalysisResults(true);
        }
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

    // 處理商品選擇
    const handleProductSelect = (product, checked) => {
        const newSelectedProducts = new Map(selectedProducts);
        if (checked) {
            newSelectedProducts.set(product.id, {
                product: product,
                quantity: 1,
                selected: true
            });
        } else {
            newSelectedProducts.delete(product.id);
        }
        setSelectedProducts(newSelectedProducts);
    }

    // 處理數量變更
    const handleQuantityChange = (productId, quantity) => {
        const newSelectedProducts = new Map(selectedProducts);
        if (newSelectedProducts.has(productId)) {
            const item = newSelectedProducts.get(productId);
            newSelectedProducts.set(productId, {
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
            alert('請選擇要購買的商品');
            return;
        }

        if (!window.confirm(`確認為客戶 ${customerData.name} 購買 ${selectedItems.length} 項商品？`)) {
            return;
        }

        setIsPurchasing(true);
        try {
            // 準備購買資料
            const customerToProductList = selectedItems.map(item => ({
                customerId: customerData.id,
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
                purchaseDate: new Date().toISOString(),
                notes: `客戶 ${customerData.name} 購買商品 ${item.product.name}`,
                state: '正常'
            }));

            // 調用 API 批量新增購買紀錄
            const response = await addMultipleCustomerToProduct(customerToProductList);
            
            if (response.data.success) {
                alert('購買成功！即將返回客戶管理頁面');
                // 返回客戶管理頁面，並帶上購買成功的狀態
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
                total += (item.product.price || 0) * item.quantity;
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
                    <th>商品圖片</th>
                    <th>商品名稱</th>
                    <th>分類</th>
                    <th>價格</th>
                    <th>狀態</th>
                    {customerData && <th>數量</th>}
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan={customerData ? "8" : "6"} className={styles.loadingContainer}>
                            <img src={loadingGif} alt="Loading..." />
                        </td>
                    </tr>
                ) : productList.length === 0 ? (
                    <tr>
                        <td colSpan={customerData ? "8" : "6"} className={styles.emptyState}>
                            查無資料
                        </td>
                    </tr>
                ) : (
                    productList.map((product) => (
                        <tr key={product.id}>
                            {customerData && (
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.has(product.id)}
                                        onChange={(e) => handleProductSelect(product, e.target.checked)}
                                        className={styles.productCheckbox}
                                    />
                                </td>
                            )}
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
                            {customerData && (
                                <td>
                                    <input
                                        type="number"
                                        min="1"
                                        value={selectedProducts.get(product.id)?.quantity || 1}
                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                        disabled={!selectedProducts.has(product.id)}
                                        className={styles.quantityInput}
                                    />
                                </td>
                            )}
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
                        {customerData && (
                            <div className={styles.cardCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.has(product.id)}
                                    onChange={(e) => handleProductSelect(product, e.target.checked)}
                                />
                                <label>選擇商品</label>
                            </div>
                        )}
                        
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

                            {customerData && (
                                <div className={styles.cardRow}>
                                    <span className={styles.cardLabel}>數量：</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={selectedProducts.get(product.id)?.quantity || 1}
                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                        disabled={!selectedProducts.has(product.id)}
                                        className={styles.quantityInput}
                                    />
                                </div>
                            )}
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

            <h2>客戶綁定</h2>
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
                    <h2>客戶分析結果</h2>
                    <AnalysisResult 
                        analysisResults={customerData.analysisResults}
                        onDeleteResult={null} // 在商品頁面不允許刪除分析結果
                    />
                </div>
            )}
            
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
                            <div key={item.product.id} className={styles.selectedItem}>
                                <span className={styles.itemName}>{item.product.name}</span>
                                <span className={styles.itemQuantity}>x {item.quantity}</span>
                                <span className={styles.itemPrice}>
                                    NT$ {((item.product.price || 0) * item.quantity).toLocaleString()}
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
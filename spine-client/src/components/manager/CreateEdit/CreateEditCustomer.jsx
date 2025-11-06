import React, { useEffect, useState } from 'react';
import style from './CreateEdit.module.css';
import AnalysisResult from '../AnalysisResult/AnalysisResult';
import SearchBarProduct from '../SearchBar/SearchBarProduct';
import { getProductList } from '../../../api/manager/product';
import { getProductCategoryList } from '../../../api/manager/product-category';

function CreateEditCustomer({typePage, customer, analysisResults, handleUpdateCustomer, handleAddCustomer, onRefreshAnalysisResults}) {
    // 編輯新增頁狀態
    const typePageList = {CREATE:"CREATE", EDIT:'EDIT'};
    // 編輯客戶資訊
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [birthday, setBirthday] = useState('');
    const [gender, setGender] = useState('');
    const [state, setState] = useState("正常");
    const [notes, setNotes] = useState('');

    // 商品搜尋相關狀態
    const [categoryList, setCategoryList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showProductSearch, setShowProductSearch] = useState(false);

    /* 初始客戶, 編輯客戶資訊 */
    useEffect(() => {
        console.log("useEffect customer");
        if (customer) {
            setName(customer.name || '');
            setEmail(customer.email || '');
            setPhone(customer.phone || '');
            setAddress(customer.address || '');
            setBirthday(customer.birthday || '');
            setGender(customer.gender || '');
            setState(customer.state || '正常');
            setNotes(customer.notes || '');
            // 如果客戶有關聯的商品，載入已選商品
            setSelectedProducts(customer.relatedProducts || []);
        }
    }, [customer]);

    /* 載入商品分類列表 */
    useEffect(() => {
        const fetchCategoryList = async () => {
            try {
                const response = await getProductCategoryList();
                setCategoryList(response.data || []);
            } catch (error) {
                console.error('獲取商品分類失敗:', error);
            }
        };
        fetchCategoryList();
    }, []);

    /* post 新增客戶 */
    const clickAddCustomer = async () => {
        if(typePage !== typePageList.CREATE) return;
        if (!name || !email || !phone) {
            alert('請填寫必要欄位：姓名、電子郵件、電話');
            return;
        }
        const customerData = {
            name, email, phone, address, birthday, gender, state, notes,
            relatedProducts: selectedProducts
        };
        handleAddCustomer(customerData);
    }

    /* 編輯客戶, 更新編輯客戶 */
    const clickUpdateCustomer = async () => {
        if(typePage !== typePageList.EDIT) return;
        if (!name || !email || !phone) {
            alert('請填寫必要欄位：姓名、電子郵件、電話');
            return;
        }
        const customerData = {
            name, email, phone, address, birthday, gender, state, notes,
            relatedProducts: selectedProducts
        };
        handleUpdateCustomer(customerData);
    }

    /* 處理分析結果刪除 */
    const handleDeleteAnalysisResult = (resultId, index) => {
        // 通知父組件刷新分析結果列表
        if (onRefreshAnalysisResults) {
            onRefreshAnalysisResults();
        }
    }

    /* 處理商品搜尋 */
    const handleProductSearch = async (searchParam) => {
        try {
            const pagingParam = { page: 1, limit: 20 }; // 預設分頁參數
            const response = await getProductList(searchParam, pagingParam);
            setSearchResults(response.data?.productList || []);
        } catch (error) {
            console.error('搜尋商品失敗:', error);
            setSearchResults([]);
        }
    }

    /* 添加商品到選中清單 */
    const handleAddProduct = (product) => {
        const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
        if (!isAlreadySelected) {
            setSelectedProducts([...selectedProducts, product]);
        } else {
            alert('此商品已經被選中');
        }
    }

    /* 從選中清單移除商品 */
    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    }

    return (
        <div className={style.CreateEditProduct}>
            <div className={style.CreateEditProductTopBar}>
                <div className={style.CreateEditProductRow}>
                    <span>狀態:{typePage === typePageList.CREATE ? '(新增)' : '(編輯)'} {state}</span>
                </div>
                <div className={style.CreateEditProductRow}>
                    {typePage === typePageList.CREATE ? 
                        <button onClick={clickAddCustomer}>新增</button>
                        : <button onClick={clickUpdateCustomer}>儲存</button>
                    } 
                    <button>刪除</button>
                </div>
                <div className={style.CreateEditProductRow}>
                    <input className={style.CreateEditProductTopInput}
                        type="text" 
                        placeholder='客戶姓名'
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
            </div>

            <div className={style.CreateEditProductContainer}>
                
                <h2>分析結果</h2>
                <AnalysisResult 
                    analysisResults={analysisResults} 
                    onDeleteResult={handleDeleteAnalysisResult}
                />

                <h2>相關商品</h2>
                <div className={style.CreateEditProductRow}>
                    <button onClick={() => setShowProductSearch(!showProductSearch)}>
                        {showProductSearch ? '隱藏' : '顯示'}商品搜尋
                    </button>
                </div>
                
                {/* 商品搜尋區域 */}
                {showProductSearch && (
                    <div className={style.ProductSearchContainer}>
                        <SearchBarProduct 
                            getSearchParam={handleProductSearch}
                            categoryList={categoryList}
                            pagingParam={{ page: 1, limit: 20 }}
                        />
                        
                        {/* 搜尋結果顯示 */}
                        {searchResults.length > 0 && (
                            <div className={style.SearchResultsContainer}>
                                <h4>搜尋結果：</h4>
                                <div className={style.ProductGrid}>
                                    {searchResults.map(product => (
                                        <div key={product.id} className={style.ProductCard}>
                                            <div className={style.ProductInfo}>
                                                <h5>{product.name}</h5>
                                                <p>價格: ${product.price}</p>
                                                <p>分類: {product.categoryName}</p>
                                                {product.description && <p>{product.description}</p>}
                                            </div>
                                            <button 
                                                onClick={() => handleAddProduct(product)}
                                                className={style.AddProductBtn}
                                            >
                                                選擇
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 已選中的商品列表 */}
                {selectedProducts.length > 0 && (
                    <div className={style.SelectedProductsContainer}>
                        <h4>已選商品：</h4>
                        <div className={style.SelectedProductsList}>
                            {selectedProducts.map(product => (
                                <div key={product.id} className={style.SelectedProductItem}>
                                    <span className={style.ProductName}>{product.name}</span>
                                    <span className={style.ProductPrice}>${product.price}</span>
                                    <button 
                                        onClick={() => handleRemoveProduct(product.id)}
                                        className={style.RemoveProductBtn}
                                    >
                                        移除
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h2>基本資訊</h2>
                <div className={style.CreateEditProductRow}>
                    <label>電子郵件: *</label>
                    <input
                        type="email"
                        placeholder="請輸入電子郵件"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>電話: *</label>
                    <input
                        type="tel"
                        placeholder="請輸入電話號碼"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>地址:</label>
                    <input
                        type="text"
                        placeholder="請輸入地址"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                    />
                </div>
            </div>

            <div className={style.CreateEditProductContainer}>
                <h2>個人資訊</h2>
                <div className={style.CreateEditProductRow}>
                    <label>生日:</label>
                    <input
                        type="date"
                        value={birthday}
                        onChange={e => setBirthday(e.target.value)}
                    />
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>性別:</label>
                    <select value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="">請選擇</option>
                        <option value="男">男</option>
                        <option value="女">女</option>
                        <option value="其他">其他</option>
                    </select>
                </div>
            </div>

            <div className={style.CreateEditProductContainer}>
                <h2>狀態管理</h2>
                <div className={style.CreateEditProductRow}>
                    <label>客戶狀態:</label>
                    <select value={state} onChange={e => setState(e.target.value)}>
                        <option value="正常">正常</option>
                        <option value="暫停">暫停</option>
                        <option value="黑名單">黑名單</option>
                    </select>
                </div>
            </div>

            <div className={style.CreateEditProductContainer}>
                <h2>備註</h2>
                <div className={style.CreateEditProductRow}>
                    <textarea
                        placeholder="客戶備註資訊"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows="4"
                        cols="50"
                    />
                </div>
            </div>
        </div>
    );
}
export default CreateEditCustomer;
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import style from './CreateEdit.module.css';
import AnalysisResult from '../AnalysisResult/AnalysisResult';
import ProductRecommendationModal from '../ProductRecommendation/ProductRecommendationModal';
import { getCustomerToProductPillowByCustomerId } from '../../../api/manager/customerToProductPillow';

function CreateEditCustomer({typePage, customer, analysisResults, handleUpdateCustomer, handleAddCustomer, onRefreshAnalysisResults}) {
    const navigate = useNavigate();
    const location = useLocation();
    
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
    const [age, setAge] = useState('');
    
    // 購買商品相關狀態
    const [purchasedProducts, setPurchasedProducts] = useState([]);
    const [purchaseStats, setPurchaseStats] = useState(null);
    const [showPurchasedProducts, setShowPurchasedProducts] = useState(false);
    
    // 推薦商品彈窗狀態
    const [showRecommendationModal, setShowRecommendationModal] = useState(false);

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
            setAge(customer.age || '');
            
            // 載入客戶的購買商品
            if (customer.id) {
                fetchPurchasedProducts(customer.id);
            }
        }
    }, [customer]);

    /* 檢查是否從商品頁面購買成功返回 */
    useEffect(() => {
        if (location.state?.purchaseSuccess && customer?.id) {
            alert(`購買成功！已為客戶 ${customer.name} 新增購買紀錄`);
            // 重新載入購買商品列表
            fetchPurchasedProducts(customer.id);
            
            // 清除 location state 避免重複提示
            navigate(location.pathname, { replace: true });
        }
    }, [location.state, customer, navigate]);

    /* 載入客戶購買的枕頭商品 */
    const fetchPurchasedProducts = async (customerId) => {
        try {
            const response = await getCustomerToProductPillowByCustomerId(customerId);
            if (response?.data?.records) {
                setPurchasedProducts(response.data.records);
                
                // 計算購買統計
                const stats = calculatePurchaseStats(response.data.records);
                setPurchaseStats(stats);
            }
        } catch (error) {
            console.error('載入客戶購買枕頭商品失敗:', error);
        }
    }

    /* 計算購買統計 */
    const calculatePurchaseStats = (purchases) => {
        let totalQuantity = 0;
        let totalAmount = 0;
        const productCounts = {};
        
        purchases.forEach(purchase => {
            totalQuantity += purchase.quantity || 0;
            totalAmount += (purchase.price || 0) * (purchase.quantity || 0);
            
            const productName = purchase.productPillowInfo?.name || '未知枕頭商品';
            if (productCounts[productName]) {
                productCounts[productName] += purchase.quantity || 0;
            } else {
                productCounts[productName] = purchase.quantity || 0;
            }
        });
        
        return {
            totalPurchases: purchases.length,
            totalQuantity,
            totalAmount,
            productCounts
        };
    }

    /* post 新增客戶 */
    const clickAddCustomer = async () => {
        if(typePage !== typePageList.CREATE) return;
        if (!name || !email || !phone) {
            alert('請填寫必要欄位：姓名、電子郵件、電話');
            return;
        }
        handleAddCustomer({name, email, phone, address, birthday, gender, state, notes, age});
    }

    /* 編輯客戶, 更新編輯客戶 */
    const clickUpdateCustomer = async () => {
        if(typePage !== typePageList.EDIT) return;
        if (!name || !email || !phone) {
            alert('請填寫必要欄位：姓名、電子郵件、電話');
            return;
        }
        handleUpdateCustomer({name, email, phone, address, birthday, gender, state, notes, age});
    }

    /* 處理分析結果刪除 */
    const handleDeleteAnalysisResult = (resultId, index) => {
        // 通知父組件刷新分析結果列表
        if (onRefreshAnalysisResults) {
            onRefreshAnalysisResults();
        }
    }

    /* 處理購買商品按鈕點擊 */
    const handlePurchaseProduct = () => {
        // 準備客戶完整資料
        const customerData = {
            id: customer?.id,
            name,
            email,
            phone,
            address,
            birthday,
            gender,
            state,
            notes,
            age,
            analysisResults
        };
        
        // 跳轉到枕頭商品推薦列表頁面，並傳遞客戶資料
        navigate('/manager/product-pillow-recommendation', { 
            state: { 
                customerData,
                fromCustomerPage: true
            }
        });
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
                
                <div className={style.SectionHeader}>
                    <h2>分析結果</h2>
                    {analysisResults && analysisResults.length > 0 && (
                        <button 
                            className={style.RecommendButton}
                            onClick={() => setShowRecommendationModal(true)}
                        >
                            推薦商品
                        </button>
                    )}
                </div>
                <AnalysisResult 
                    analysisResults={analysisResults} 
                    onDeleteResult={handleDeleteAnalysisResult}
                />
                
                {/* 推薦商品彈窗 */}
                <ProductRecommendationModal
                    isOpen={showRecommendationModal}
                    onClose={() => setShowRecommendationModal(false)}
                    analysisResults={analysisResults}
                />
                
                <h2>購買枕頭商品</h2>
                <div className={style.CreateEditProductRow}>
                    <button onClick={handlePurchaseProduct}>購買枕頭商品</button>
                    {purchasedProducts.length > 0 && (
                        <button onClick={() => setShowPurchasedProducts(!showPurchasedProducts)}>
                            {showPurchasedProducts ? '隱藏' : '顯示'}購買紀錄
                        </button>
                    )}
                </div>
                
                {/* 購買統計 */}
                {purchaseStats && (
                    <div className={style.PurchaseStatsContainer}>
                        <h4>購買枕頭統計</h4>
                        <div className={style.StatsGrid}>
                            <div className={style.StatItem}>
                                <span className={style.StatLabel}>總購買次數:</span>
                                <span className={style.StatValue}>{purchaseStats.totalPurchases}</span>
                            </div>
                            <div className={style.StatItem}>
                                <span className={style.StatLabel}>總購買數量:</span>
                                <span className={style.StatValue}>{purchaseStats.totalQuantity}</span>
                            </div>
                            <div className={style.StatItem}>
                                <span className={style.StatLabel}>總消費金額:</span>
                                <span className={style.StatValue}>NT$ {purchaseStats.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 購買枕頭商品列表 */}
                {showPurchasedProducts && purchasedProducts.length > 0 && (
                    <div className={style.PurchasedProductsContainer}>
                        <h4>購買枕頭商品列表</h4>
                        <div className={style.PurchasedProductsList}>
                            {purchasedProducts.map((purchase, index) => (
                                <div key={`${purchase.id}-${index}`} className={style.PurchasedProductItem}>
                                    <div className={style.ProductBasicInfo}>
                                        <h5>{purchase.productPillowInfo?.name || '未知枕頭商品'}</h5>
                                        <p className={style.PurchaseDate}>
                                            購買日期: {new Date(purchase.purchaseDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className={style.ProductPurchaseInfo}>
                                        <span className={style.Quantity}>數量: {purchase.quantity}</span>
                                        <span className={style.Price}>
                                            單價: NT$ {(purchase.price || 0).toLocaleString()}
                                        </span>
                                        <span className={style.Total}>
                                            小計: NT$ {((purchase.price || 0) * (purchase.quantity || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                    {purchase.notes && (
                                        <p className={style.PurchaseNotes}>{purchase.notes}</p>
                                    )}
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
                    <label>年齡:</label>
                    <input
                        type="number"
                        placeholder="請輸入年齡"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        min="0"
                        max="150"
                    />
                </div>
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
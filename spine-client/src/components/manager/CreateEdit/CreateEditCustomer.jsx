import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import style from './CreateEdit.module.css';
import AnalysisResult from '../AnalysisResult/AnalysisResult';
import PillowRecommendationModal from '../ProductRecommendation/PillowRecommendationModal';
import MattressRecommendationModal from '../ProductRecommendation/MattressRecommendationModal';
import { getCustomerToProductPillowByCustomerId } from '../../../api/manager/customerToProductPillow';
import { getCustomerToProductMattressByCustomerId } from '../../../api/manager/customerToProductMattress';
import { 
    calculateDefaultHeight, 
    formatDefaultHeight,
    calculateAdjustedDefaultHeight,
    calculateStandardWeight
} from '../../../utils/calculateDefaultHeight';
import { extractSpineRecommendation, extractSpinePointDistances, computeShimAdjustment, computeExtra58Height, calculateStandardLength58 } from '../../../utils/spineRecommendation';

function CreateEditCustomer({typePage, customer, analysisResults, handleUpdateCustomer, handleAddCustomer, onRefreshAnalysisResults, isAnalysisLoading = false, fromSpineAnalysis = false}) {
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
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [defaultHeight, setDefaultHeight] = useState(null);
    const [baseHeight, setBaseHeight] = useState(null);
    const [standardWeight, setStandardWeight] = useState(null);
    const [weightDeviation, setWeightDeviation] = useState(null);
    const [heightAdjustment, setHeightAdjustment] = useState(0);
    
    // 頸椎分析推薦相關狀態
    const [spinePoint24Distance, setSpinePoint24Distance] = useState(null);
    const [spinePillowRecommendation, setSpinePillowRecommendation] = useState('');

    // 脊椎曲線特殊調整 — 點位距離
    const [spinePoint37Distance, setSpinePoint37Distance] = useState(null);
    const [spinePoint58Distance, setSpinePoint58Distance] = useState(null);
    // 根據身高自動計算標準長度，不再是固定值
    const spine58StandardLength = calculateStandardLength58(height);
    
    // 購買商品相關狀態
    const [purchasedProducts, setPurchasedProducts] = useState([]);
    const [purchaseStats, setPurchaseStats] = useState(null);
    const [showPurchasedProducts, setShowPurchasedProducts] = useState(false);
    
    // 枕頭推薦彈窗狀態
    const [showPillowRecommendationModal, setShowPillowRecommendationModal] = useState(false);
    
    // 床墊推薦彈窗狀態
    const [showMattressRecommendationModal, setShowMattressRecommendationModal] = useState(false);

    /* 計算年齡 - 根據生日計算實際年齡 */
    const calculateAge = (birthdayDate) => {
        if (!birthdayDate) return '';
        
        const birthDate = new Date(birthdayDate);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // 如果還沒到生日月份，或是同月但還沒到生日日期，年齡減1
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
        }
        
        return calculatedAge.toString();
    };

    /* 驗證年齡與生日的一致性 */
    const validateAgeAndBirthday = () => {
        // 如果沒有生日，跳過驗證
        if (!birthday) return true;
        
        const calculatedAge = calculateAge(birthday);
        
        // 如果有手動輸入的年齡，且與計算出的年齡不一致
        if (age && calculatedAge && age !== calculatedAge) {
            return false;
        }
        
        return true;
    };

    /* 初始客戶, 編輯客戶資訊 */
    useEffect(() => {
        console.log("useEffect customer");
        if (customer) {
            setName(customer.name || '');
            setEmail(customer.email || '');
            setPhone(customer.phone || '');
            setAddress(customer.address || '');
            const birthdayValue = customer.birthday || '';
            setBirthday(birthdayValue);
            setGender(customer.gender || '');
            setState(customer.state || '正常');
            setNotes(customer.notes || '');
            
            // 每次開啟頁面時，根據生日重新計算年齡
            if (birthdayValue) {
                const calculatedAge = calculateAge(birthdayValue);
                setAge(calculatedAge);
            } else {
                setAge(customer.age || '');
            }
            
            // 設定身高和體重
            setHeight(customer.height || '');
            setWeight(customer.weight || '');
            
            // 載入客戶的購買商品
            if (customer.id) {
                fetchPurchasedProducts(customer.id);
            }
        }
    }, [customer]);

    /* 當生日改變時自動計算年齡 */
    useEffect(() => {
        if (birthday) {
            const calculatedAge = calculateAge(birthday);
            setAge(calculatedAge);
        }
    }, [birthday]);

    /* 當年齡、身高、性別或體重改變時自動計算初始高度 */
    useEffect(() => {
        const result = calculateAdjustedDefaultHeight(age, height, gender, weight);
        
        setBaseHeight(result.baseHeight);
        setStandardWeight(result.standardWeight);
        setWeightDeviation(result.weightDeviation);
        setHeightAdjustment(result.heightAdjustment);
        setDefaultHeight(result.finalHeight);
    }, [age, height, gender, weight]);

    /* 當分析結果改變時，計算頸椎點2-4距離和推薦型號，以及點3-7、5-8距離 */
    useEffect(() => {
        const spineRecommendation = extractSpineRecommendation(analysisResults);
        
        if (spineRecommendation) {
            setSpinePoint24Distance(spineRecommendation.distance);
            setSpinePillowRecommendation(spineRecommendation.recommendation);
        } else {
            setSpinePoint24Distance(null);
            setSpinePillowRecommendation('');
        }

        const spineDistances = extractSpinePointDistances(analysisResults);
        if (spineDistances) {
            setSpinePoint37Distance(spineDistances.dist37);
            setSpinePoint58Distance(spineDistances.dist58);
        } else {
            setSpinePoint37Distance(null);
            setSpinePoint58Distance(null);
        }
    }, [analysisResults]);

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

    // 追蹤是否已顯示過頸部分析帶入確認
    const spineAnalysisPromptShown = useRef(false);

    /* 從頸部分析頁面綁定客戶後，詢問是否帶入最新分析數據 */
    useEffect(() => {
        if (fromSpineAnalysis && customer?.id && !spineAnalysisPromptShown.current && analysisResults && analysisResults.length > 0) {
            spineAnalysisPromptShown.current = true;
            const shouldApply = window.confirm('是否將最新的頸部分析分析數據帶入?');
            if (shouldApply && onRefreshAnalysisResults) {
                onRefreshAnalysisResults();
            }
        }
    }, [fromSpineAnalysis, customer?.id, analysisResults, onRefreshAnalysisResults]);

    /* 更新頸部分析：手動刷新最新分析數據 */
    const handleRefreshSpineAnalysis = () => {
        const shouldApply = window.confirm('是否將最新的頸部分析分析數據帶入?');
        if (shouldApply && onRefreshAnalysisResults) {
            onRefreshAnalysisResults();
        }
    };

    /* 載入客戶購買的所有商品（枕頭 + 床墊）*/
    const fetchPurchasedProducts = async (customerId) => {
        try {
            // 同時取得枕頭和床墊購買紀錄
            const [pillowResponse, mattressResponse] = await Promise.all([
                getCustomerToProductPillowByCustomerId(customerId),
                getCustomerToProductMattressByCustomerId(customerId)
            ]);
            
            // 合併兩種商品的購買紀錄，並標記商品類型
            const pillowProducts = (pillowResponse?.data?.records || []).map(item => ({
                ...item,
                productType: 'pillow',
                productInfo: item.productPillowInfo
            }));
            
            const mattressProducts = (mattressResponse?.data?.records || []).map(item => ({
                ...item,
                productType: 'mattress',
                productInfo: item.productMattressInfo
            }));
            
            // 合併並按購買日期排序（由新到舊）
            const allProducts = [...pillowProducts, ...mattressProducts].sort((a, b) => {
                return new Date(b.purchaseDate) - new Date(a.purchaseDate);
            });
            
            setPurchasedProducts(allProducts);
            
            // 計算購買統計
            const stats = calculatePurchaseStats(allProducts);
            setPurchaseStats(stats);
        } catch (error) {
            console.error('載入客戶購買商品失敗:', error);
        }
    }

    /* 計算購買統計（枕頭 + 床墊）*/
    const calculatePurchaseStats = (purchases) => {
        let totalQuantity = 0;
        let totalAmount = 0;
        const productCounts = {};
        let pillowCount = 0;
        let mattressCount = 0;
        
        purchases.forEach(purchase => {
            totalQuantity += purchase.quantity || 0;
            totalAmount += (purchase.price || 0) * (purchase.quantity || 0);
            
            // 根據商品類型取得商品名稱
            let productName;
            if (purchase.productType === 'pillow') {
                productName = purchase.productInfo?.name || '未知枕頭商品';
                pillowCount += purchase.quantity || 0;
            } else if (purchase.productType === 'mattress') {
                productName = purchase.productInfo?.name || '未知床墊商品';
                mattressCount += purchase.quantity || 0;
            } else {
                productName = '';
            }
            
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
            productCounts,
            pillowCount,
            mattressCount
        };
    }

    /* post 新增客戶 */
    const clickAddCustomer = async () => {
        if(typePage !== typePageList.CREATE) return;
        if (!name || !email || !phone) {
            alert('請填寫必要欄位：姓名、電子郵件、電話');
            return;
        }
        
        // 驗證年齡與生日的一致性
        if (!validateAgeAndBirthday()) {
            const calculatedAge = calculateAge(birthday);
            alert(`年齡與生日不一致！\n根據生日 ${birthday} 計算的年齡應為 ${calculatedAge} 歲，但您輸入的年齡是 ${age} 歲。\n請修正年齡欄位或重新輸入生日。`);
            return;
        }
        
        handleAddCustomer({name, email, phone, address, birthday, gender, state, notes, age, height, weight});
    }

    /* 編輯客戶, 更新編輯客戶 */
    const clickUpdateCustomer = async () => {
        if(typePage !== typePageList.EDIT) return;
        if (!name || !email || !phone) {
            alert('請填寫必要欄位：姓名、電子郵件、電話');
            return;
        }
        
        // 驗證年齡與生日的一致性
        if (!validateAgeAndBirthday()) {
            const calculatedAge = calculateAge(birthday);
            alert(`年齡與生日不一致！\n根據生日 ${birthday} 計算的年齡應為 ${calculatedAge} 歲，但您輸入的年齡是 ${age} 歲。\n請修正年齡欄位或重新輸入生日。`);
            return;
        }
        
        handleUpdateCustomer({name, email, phone, address, birthday, gender, state, notes, age, height, weight});
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
            height,
            defaultHeight,
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

    /* 處理購買床墊商品按鈕點擊 */
    const handlePurchaseMattress = () => {
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
            height,
            defaultHeight,
            analysisResults
        };
        
        // 跳轉到床墊商品推薦列表頁面，並傳遞客戶資料
        navigate('/manager/product-mattress-recommendation', { 
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
                
                <AnalysisResult 
                    analysisResults={analysisResults} 
                    onDeleteResult={handleDeleteAnalysisResult}
                    isLoading={isAnalysisLoading}
                />
                
                <h2>購買商品</h2>
                <div className={style.CreateEditProductRow}>
                    <button onClick={handlePurchaseProduct}>購買枕頭商品</button>
                    <button onClick={() => setShowPillowRecommendationModal(true)}>推薦枕頭</button>
                    <button onClick={handlePurchaseMattress}>購買床墊商品</button>
                    <button onClick={() => setShowMattressRecommendationModal(true)}>推薦床墊</button>
                    {purchasedProducts.length > 0 && (
                        <button onClick={() => setShowPurchasedProducts(!showPurchasedProducts)}>
                            {showPurchasedProducts ? '隱藏' : '顯示'}購買紀錄
                        </button>
                    )}
                </div>
                
                {/* 枕頭推薦彈窗 */}
                <PillowRecommendationModal
                    isOpen={showPillowRecommendationModal}
                    onClose={() => setShowPillowRecommendationModal(false)}
                    customerData={{
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
                        height,
                        defaultHeight,
                        analysisResults
                    }}
                />
                
                {/* 床墊推薦彈窗 */}
                <MattressRecommendationModal
                    isOpen={showMattressRecommendationModal}
                    onClose={() => setShowMattressRecommendationModal(false)}
                    customerData={{
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
                        height,
                        defaultHeight,
                        analysisResults
                    }}
                />
                
                {/* 購買統計 */}
                {purchaseStats && (
                    <div className={style.PurchaseStatsContainer}>
                        <h4>商品統計</h4>
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
                
                {/* 購買商品列表（枕頭 + 床墊）*/}
                {showPurchasedProducts && purchasedProducts.length > 0 && (
                    <div className={style.PurchasedProductsContainer}>
                        <h4>購買商品列表</h4>
                        <div className={style.PurchasedProductsList}>
                            {purchasedProducts.map((purchase, index) => {
                                // 根據商品類型取得商品名稱和類型標籤
                                const productName = purchase.productInfo?.name || '';
                                const productTypeLabel = purchase.productType === 'pillow' ? '枕頭' : '床墊';
                                
                                return (
                                    <div key={`${purchase.id}-${index}`} className={style.PurchasedProductItem}>
                                        <div className={style.ProductBasicInfo}>
                                            <h5>
                                                [{productTypeLabel}] {productName}
                                            </h5>
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
                                );
                            })}
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
                    <label>年齡:</label>
                    <input
                        type="number"
                        placeholder="請輸入年齡"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        min="0"
                        max="150"
                    />
                    <small style={{ marginLeft: '10px', color: '#666' }}>
                        {birthday && `(根據生日計算: ${calculateAge(birthday)} 歲)`}
                        {!birthday && '(輸入生日後將自動計算)'}
                    </small>
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
                <div className={style.CreateEditProductRow}>
                    <label>身高 (cm):</label>
                    <input
                        type="number"
                        placeholder="請輸入身高（公分）"
                        value={height}
                        onChange={e => setHeight(e.target.value)}
                        min="0"
                        max="300"
                    />
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>體重 (kg):</label>
                    <input
                        type="number"
                        placeholder="請輸入體重（公斤）"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        min="0"
                        max="500"
                        step="0.1"
                    />
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>標準體重 (kg):</label>
                    <input
                        type="text"
                        value={standardWeight !== null ? `${standardWeight.toFixed(1)} kg` : '請輸入身高及性別'}
                        readOnly
                        style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                        placeholder="自動計算"
                    />
                    <small style={{ marginLeft: '10px', color: '#666' }}>
                        {gender === '男' && '(身高 - 80) × 70%'}
                        {gender === '女' && '(身高 - 70) × 60%'}
                        {!gender && '(需選擇性別)'}
                    </small>
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>體重偏差 (kg):</label>
                    <input
                        type="text"
                        value={
                            weightDeviation !== null 
                                ? `${weightDeviation > 0 ? '+' : ''}${weightDeviation.toFixed(1)} kg` 
                                : '請輸入體重'
                        }
                        readOnly
                        style={{ 
                            backgroundColor: '#f0f0f0', 
                            cursor: 'not-allowed',
                            color: weightDeviation > 4 ? '#d9534f' : weightDeviation < -4 ? '#5bc0de' : '#666'
                        }}
                        placeholder="自動計算"
                    />
                    <small style={{ marginLeft: '10px', color: '#666' }}>
                        (實際體重 - 標準體重)
                    </small>
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>初始高度:</label>
                    <input
                        type="text"
                        value={formatDefaultHeight(defaultHeight)}
                        readOnly
                        style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                        placeholder="自動計算"
                    />
                </div>
                {baseHeight !== null && (
                    <div className={style.CreateEditProductRow}>
                        <label></label>
                        <small style={{ color: '#666' }}>
                            基準高度: {baseHeight} cm
                            {heightAdjustment !== 0 && (
                                <>
                                    {' '} + 體重調整: {heightAdjustment > 0 ? '+' : ''}{heightAdjustment} cm
                                    {' '} = 最終高度: {defaultHeight} cm
                                </>
                            )}
                            {heightAdjustment === 0 && ' (無需調整)'}
                        </small>
                    </div>
                )}
                
                <h2>頸椎分析推薦</h2>
                <div className={style.CreateEditProductRow}>
                    <small style={{ color: '#999', fontStyle: 'italic', marginBottom: '10px', display: 'block' }}>
                        ※ 以下數據自動從最新的頸椎分析結果中提取
                    </small>
                    {typePage === 'EDIT' && (
                        <button
                            onClick={handleRefreshSpineAnalysis}
                            style={{
                                backgroundColor: '#5cb85c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 16px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                marginBottom: '10px',
                            }}
                        >
                            更新頸部分析
                        </button>
                    )}
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>點2-4距離 (cm):</label>
                    <input
                        type="text"
                        value={spinePoint24Distance !== null ? `${spinePoint24Distance.toFixed(2)} cm` : '無頸椎分析數據'}
                        readOnly
                        style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                        placeholder="需要頸椎分析結果"
                    />
                    <small style={{ marginLeft: '10px', color: '#666' }}>
                        (枕骨至第七頸椎的距離)
                    </small>
                </div>
                <div className={style.CreateEditProductRow}>
                    <label>推薦枕頭型號:</label>
                    <input
                        type="text"
                        value={spinePillowRecommendation || '無推薦'}
                        readOnly
                        style={{ 
                            backgroundColor: '#f0f0f0', 
                            cursor: 'not-allowed',
                            color: spinePillowRecommendation ? '#5cb85c' : '#666',
                            fontWeight: spinePillowRecommendation ? 'bold' : 'normal'
                        }}
                        placeholder="需要頸椎分析結果"
                    />
                    <small style={{ marginLeft: '10px', color: '#666' }}>
                        {spinePoint24Distance !== null && (
                            <>
                                {spinePoint24Distance <= 8.4 && '(≤ 8.4 cm → B 型枕)'}
                                {spinePoint24Distance >= 8.5 && spinePoint24Distance <= 10.0 && '(8.5 - 10 cm → A 型枕)'}
                                {spinePoint24Distance >= 10.1 && '(≥ 10.1 cm → AA 型枕)'}
                            </>
                        )}
                    </small>
                </div>
            </div>

            <div className={style.CreateEditProductContainer}>
                <h2>頸椎曲線特殊調整規則 (墊片與加高)</h2>
                <div className={style.CreateEditProductRow}>
                    <small style={{ color: '#999', fontStyle: 'italic', marginBottom: '10px', display: 'block' }}>
                        ※ 根據頸椎分析點位距離進行最終微調，數據自動從最新頸椎分析提取
                    </small>
                </div>

                {/* 點3-7 距離（頸椎凹點至後腦勺） */}
                <div className={style.CreateEditProductRow}>
                    <label>點3-7 距離 (cm):</label>
                    <input
                        type="text"
                        value={spinePoint37Distance !== null ? `${spinePoint37Distance.toFixed(2)} cm` : '無頸椎分析數據'}
                        readOnly
                        style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                        placeholder="需要頸椎分析結果"
                    />
                    <small style={{ marginLeft: '10px', color: '#666' }}>(頸椎凹點至後腦勺)</small>
                </div>

                {/* 點5-8 距離（頸椎凹點至背部凸點） */}
                <div className={style.CreateEditProductRow}>
                    <label>點5-8 距離 (cm):</label>
                    <input
                        type="text"
                        value={spinePoint58Distance !== null ? `${spinePoint58Distance.toFixed(2)} cm` : '無頸椎分析數據'}
                        readOnly
                        style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                        placeholder="需要頸椎分析結果"
                    />
                    <small style={{ marginLeft: '10px', color: '#666' }}>(頸椎凹點至背部凸點)</small>
                </div>

                {/* 5-8點標準長度（根據身高自動計算） */}
                <div className={style.CreateEditProductRow}>
                    <label>5-8點標準長度 (cm):</label>
                    <input
                        type="text"
                        value={
                            spine58StandardLength !== null 
                                ? `${spine58StandardLength.toFixed(2)} cm` 
                                : '請輸入身高'
                        }
                        readOnly
                        style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                        placeholder="自動計算"
                    />
                    <small style={{ marginLeft: '10px', color: '#666' }}>
                        (基準：身高 166 cm = 10 cm；根據身高等比例調整)
                    </small>
                </div>
                {/* 5-8點標準長度計算說明 */}
                {height && spine58StandardLength !== null && (
                    <div className={style.CreateEditProductRow}>
                        <label></label>
                        <div style={{ fontSize: '0.9em', color: '#555', lineHeight: '1.6' }}>
                            <div style={{ marginBottom: '5px' }}>
                                <strong>計算公式：</strong>標準長度 = 10 × &#123;1 + [(身高 - 166) / 166]&#125;
                            </div>
                            <div style={{ marginBottom: '5px' }}>
                                <strong>計算過程：</strong>
                                10 × &#123;1 + [({height} - 166) / 166]&#125; = 
                                10 × &#123;1 + [{(parseFloat(height) - 166).toFixed(2)} / 166]&#125; = 
                                10 × {(1 + (parseFloat(height) - 166) / 166).toFixed(4)} = 
                                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}> {spine58StandardLength.toFixed(2)} cm</span>
                            </div>
                            {spinePoint58Distance !== null && (
                                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                    <strong>差距換算：</strong>
                                    實際測量 {spinePoint58Distance.toFixed(2)} cm - 標準長度 {spine58StandardLength.toFixed(2)} cm = 
                                    <span style={{ 
                                        color: spinePoint58Distance > spine58StandardLength ? '#d9534f' : '#5cb85c',
                                        fontWeight: 'bold',
                                        marginLeft: '5px'
                                    }}>
                                        {spinePoint58Distance > spine58StandardLength ? '+' : ''}
                                        {(spinePoint58Distance - spine58StandardLength).toFixed(2)} cm
                                    </span>
                                    {spinePoint58Distance > spine58StandardLength && (
                                        <>
                                            <br/>
                                            換算加高：{(spinePoint58Distance - spine58StandardLength).toFixed(2)} cm ÷ 0.5 = 
                                            {((spinePoint58Distance - spine58StandardLength) / 0.5).toFixed(2)}
                                            ，取整數 = {Math.floor((spinePoint58Distance - spine58StandardLength) / 0.5)}
                                            ，需加高 <span style={{ color: '#d9534f', fontWeight: 'bold' }}>
                                                {(Math.floor((spinePoint58Distance - spine58StandardLength) / 0.5) * 0.5).toFixed(1)} cm
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 墊片調整建議（依點3-7距離） */}
                {(() => {
                    const shimAdj = computeShimAdjustment(spinePoint37Distance, heightAdjustment);
                    const modelLabel = baseHeight !== null && shimAdj?.modelSuffix
                        ? `型號: ${baseHeight}${shimAdj.modelSuffix}`
                        : null;
                    return (
                        <div className={style.CreateEditProductRow}>
                            <label>墊片調整建議:</label>
                            <input
                                type="text"
                                value={
                                    shimAdj
                                        ? shimAdj.shimText + (modelLabel ? `　→　${modelLabel}` : '')
                                        : '無頸椎分析數據'
                                }
                                readOnly
                                style={{
                                    backgroundColor: '#f0f0f0',
                                    cursor: 'not-allowed',
                                    color: shimAdj?.modelSuffix ? '#d9534f' : '#5cb85c',
                                    fontWeight: shimAdj?.modelSuffix ? 'bold' : 'normal',
                                    minWidth: '300px',
                                }}
                                placeholder="需要頸椎分析結果"
                            />
                            {spinePoint37Distance !== null && (
                                <small style={{ marginLeft: '10px', color: '#666' }}>
                                    {spinePoint37Distance < 1.6 && '(< 1.6 cm → 無需墊片)'}
                                    {spinePoint37Distance >= 1.6 && spinePoint37Distance <= 2.1 && '(1.6 - 2.1 cm → 半張墊片，型號 X.5)'}
                                    {spinePoint37Distance >= 2.2 && '(≥ 2.2 cm → 二個半張墊片，型號 X.2)'}
                                </small>
                            )}
                        </div>
                    );
                })()}

                {/* 5-8點加高調整建議 */}
                {(() => {
                    const extraH = computeExtra58Height(spinePoint58Distance, height);
                    return (
                        <div className={style.CreateEditProductRow}>
                            <label>5-8點加高調整 (cm):</label>
                            <input
                                type="text"
                                value={
                                    extraH !== null
                                        ? extraH > 0
                                            ? `額外加高 +${extraH} cm`
                                            : '無需加高'
                                        : spine58StandardLength === null
                                            ? '請輸入身高'
                                            : '無頸椎分析數據'
                                }
                                readOnly
                                style={{
                                    backgroundColor: '#f0f0f0',
                                    cursor: 'not-allowed',
                                    color: extraH !== null && extraH > 0 ? '#d9534f' : '#5cb85c',
                                    fontWeight: extraH !== null && extraH > 0 ? 'bold' : 'normal',
                                }}
                                placeholder="需要身高和頸椎分析結果"
                            />
                            {spinePoint58Distance !== null && spine58StandardLength !== null && (
                                <small style={{ marginLeft: '10px', color: '#666' }}>
                                    (5-8點距離 {spinePoint58Distance.toFixed(2)} cm，標準 {spine58StandardLength.toFixed(2)} cm，
                                    超出 {Math.max(0, spinePoint58Distance - spine58StandardLength).toFixed(2)} cm)
                                </small>
                            )}
                        </div>
                    );
                })()}
            </div>

            {/* ── 型號建議 ─────────────────────────── */}
            {(() => {
                // 將數字高度轉換為中文（6.5 → 六點五公分）
                const cnDigits = { '0': '零', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九' };
                const heightToChinese = (h) => {
                    if (h === null || h === undefined) return null;
                    return String(h).split('').map(c => c === '.' ? '點' : (cnDigits[c] || c)).join('') + '公分';
                };

                // 從 shimAdj.modelSuffix 取得墊片狀態標籤
                const shimAdj = computeShimAdjustment(spinePoint37Distance, heightAdjustment);
                const extractShimLabel = (adj) => {
                    if (!adj) return null;
                    if (!adj.modelSuffix) return '無墊片';
                    if (adj.modelSuffix === '.5') return '半張墊片';
                    if (adj.modelSuffix === '.2') return '二個半張墊片';
                    return null;
                };

                // 從推薦型號取得弧度類型（'AA 型枕' → 'AA型'）
                const extractArcLabel = (rec) => {
                    if (!rec) return null;
                    return rec.replace(/\s+/g, '').replace('枕', '');
                };

                const heightLabel = heightToChinese(defaultHeight);
                const shimLabel   = extractShimLabel(shimAdj);
                const arcLabel    = extractArcLabel(spinePillowRecommendation);

                const allReady = heightLabel && shimLabel && arcLabel;
                const modelName = allReady ? `${heightLabel}_${shimLabel}_${arcLabel}` : null;

                return (
                    <div className={style.CreateEditProductContainer}>
                        <h2>型號建議</h2>
                        <div className={style.CreateEditProductRow}>
                            <small style={{ color: '#999', fontStyle: 'italic', marginBottom: '10px', display: 'block' }}>
                                ※ 依據上方「初始高度」、「墊片調整建議」、「推薦枕頭型號」自動組合
                            </small>
                        </div>
                        <div className={style.CreateEditProductRow}>
                            <label>高度:</label>
                            <input type="text" readOnly
                                value={heightLabel ?? '請輸入年齡及身高'}
                                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }} />
                            <small style={{ marginLeft: '10px', color: '#666' }}>
                                (來源：「個人資訊」區的「初始高度」= {defaultHeight ? `${defaultHeight} cm` : '未計算'})
                            </small>
                        </div>
                        <div className={style.CreateEditProductRow}>
                            <label>墊片狀態:</label>
                            <input type="text" readOnly
                                value={shimLabel ?? '無頸椎分析數據'}
                                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }} />
                            <small style={{ marginLeft: '10px', color: '#666' }}>
                                (來源：「脊椎曲線特殊調整規則」區的「墊片調整建議」，依據點3-7距離 {spinePoint37Distance ? `${spinePoint37Distance.toFixed(2)} cm` : '未測量'})
                            </small>
                        </div>
                        <div className={style.CreateEditProductRow}>
                            <label>弧度類型:</label>
                            <input type="text" readOnly
                                value={arcLabel ?? '無頸椎分析數據'}
                                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }} />
                            <small style={{ marginLeft: '10px', color: '#666' }}>
                                (來源：「頸椎分析推薦」區的「推薦枕頭型號」，依據點2-4距離 {spinePoint24Distance ? `${spinePoint24Distance.toFixed(2)} cm` : '未測量'})
                            </small>
                        </div>
                        <div className={style.CreateEditProductRow}>
                            <label>型號命名:</label>
                            <input type="text" readOnly
                                value={modelName ?? '資料不完整，請確認上方三項數值'}
                                style={{
                                    backgroundColor: modelName ? '#e8f5e9' : '#f0f0f0',
                                    cursor: 'not-allowed',
                                    color: modelName ? '#2e7d32' : '#999',
                                    fontWeight: modelName ? 'bold' : 'normal',
                                    minWidth: '320px',
                                    fontSize: '1.05em',
                                }}
                            />
                            <small style={{ marginLeft: '10px', color: '#666' }}>
                                (組合格式：高度_墊片狀態_弧度類型)
                            </small>
                        </div>
                        {modelName && (
                            <div className={style.CreateEditProductRow}>
                                <label></label>
                                <div style={{ 
                                    fontSize: '0.9em', 
                                    color: '#555', 
                                    padding: '10px', 
                                    backgroundColor: '#e8f5e9', 
                                    borderRadius: '4px',
                                    borderLeft: '4px solid #2e7d32'
                                }}>
                                    <strong style={{ color: '#2e7d32' }}>參數來源總覽：</strong>
                                    <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
                                        <li><strong>高度 ({heightLabel})</strong>：根據年齡 {age || '?'} 歲、身高 {height || '?'} cm、性別 {gender || '?'}、體重 {weight || '?'} kg 計算而得</li>
                                        <li><strong>墊片狀態 ({shimLabel})</strong>：根據頸椎分析點3-7距離 {spinePoint37Distance ? `${spinePoint37Distance.toFixed(2)} cm` : '未測量'} 判定</li>
                                        <li><strong>弧度類型 ({arcLabel})</strong>：根據頸椎分析點2-4距離 {spinePoint24Distance ? `${spinePoint24Distance.toFixed(2)} cm` : '未測量'} 判定</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

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
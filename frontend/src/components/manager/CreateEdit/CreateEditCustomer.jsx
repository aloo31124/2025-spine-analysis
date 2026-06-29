import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import style from './CreateEdit.module.css';
import AnalysisResult from '../AnalysisResult/AnalysisResult';
import PillowRecommendationModal from '../ProductRecommendation/PillowRecommendationModal';
import MattressRecommendationModal from '../ProductRecommendation/MattressRecommendationModal';
import { getCustomerToProductPillowByCustomerId } from '../../../api/manager/customerToProductPillow';
import { getCustomerToProductMattressByCustomerId } from '../../../api/manager/customerToProductMattress';
import {
    calculateAdjustedDefaultHeight,
    extractSpineRecommendation,
    extractSpinePointDistances,
    describeStandardWeight,
    describeWeightDeviation,
    describeHeightAdjustment,
    describeInitialHeight,
    describeFinalHeight,
    getUnderEightShimNote,
    describePillowType,
    computeShimAdjustment,
    describeShimAdjustment,
    STANDARD_LENGTH_58,
    describeStandardLengthRatio,
    describeLevel58,
    composeModelName,
} from '../../../utils/spineRecommendation';

/* ── 唯讀數值欄樣式 ───────────────────────────── */
const READONLY_INPUT_STYLE = { backgroundColor: '#f0f0f0', cursor: 'not-allowed' };
const RESULT_INPUT_STYLE = {
    backgroundColor: '#e8f5e9', cursor: 'not-allowed', color: '#2e7d32', fontWeight: 'bold',
};

/**
 * 唯讀計算欄：顯示「標題 + 數值 + 右側提示」。
 * 計算公式與代入過程改由 <FormulaNote> 呈現，保持版面單一職責。
 */
function CalcField({ label, value, hint, highlight = false, valueStyle = {} }) {
    return (
        <div className={style.CreateEditProductRow}>
            <label>{label}</label>
            <input
                type="text"
                value={value}
                readOnly
                style={{ ...(highlight ? RESULT_INPUT_STYLE : READONLY_INPUT_STYLE), ...valueStyle }}
            />
            {hint && <small style={{ marginLeft: '10px', color: '#666' }}>{hint}</small>}
        </div>
    );
}

/**
 * 計算公式呈現列：完整顯示「公式」與「代入計算過程」。
 * @param {{ formula?:string, process?:string }} props
 */
function FormulaNote({ formula, process }) {
    if (!formula && !process) return null;
    return (
        <div className={style.CreateEditProductRow}>
            <label></label>
            <div style={{ fontSize: '0.9em', color: '#555', lineHeight: 1.6 }}>
                {formula && <div><strong>公式：</strong>{formula}</div>}
                {process && <div><strong>計算：</strong>{process}</div>}
            </div>
        </div>
    );
}

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
        if (!name || !phone) {
            alert('請填寫必要欄位：姓名、電話');
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
        if (!name || !phone) {
            alert('請填寫必要欄位：姓名、電話');
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

    // 型號命名建議計算結果（供推薦枕頭彈窗顯示用）
    const { modelName } = composeModelName({
        finalHeight: defaultHeight,
        shimAdj: computeShimAdjustment(spinePoint37Distance, defaultHeight),
        pillowRecommendation: spinePillowRecommendation,
    });

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
                    modelName={modelName}
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
                    <label>電子郵件:</label>
                    <input
                        type="email"
                        placeholder="請輸入電子郵件"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
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
            </div>

            {(() => {
                const init = describeInitialHeight(age, height);          // 初始高度
                const sw = describeStandardWeight(height, gender);        // 標準體重
                const wd = describeWeightDeviation(weight, standardWeight); // 體重偏差
                const ha = describeHeightAdjustment(weightDeviation);     // 體重偏差高度調整
                const fh = describeFinalHeight(baseHeight, heightAdjustment); // 最終基準高度
                const underEightNote = getUnderEightShimNote(age);

                return (
                    <div className={style.CreateEditProductContainer}>
                        <h2>最終基準高度</h2>
                        <div className={style.CreateEditProductRow}>
                            <small style={{ color: '#999', fontStyle: 'italic', display: 'block' }}>
                                ※ 依據「個人資訊」之性別、身高、體重、年齡，依「初始高度對照表」與「體重偏離調整表」計算
                            </small>
                        </div>

                        {/* 初始高度 */}
                        <CalcField
                            label="初始高度 (cm):"
                            value={init.value !== null ? `${init.value} cm` : '請輸入年齡及身高'}
                            hint="參考「初始高度對照表」（依年齡 / 身高判斷）"
                        />
                        {(age !== '' || height !== '') && (
                            <FormulaNote formula={init.formula} process={init.process} />
                        )}

                        {/* 標準體重 */}
                        <CalcField
                            label="標準體重 (kg):"
                            value={sw.value !== null ? `${sw.value.toFixed(1)} kg` : '請輸入身高及性別'}
                            hint={sw.formula}
                        />
                        {sw.process && <FormulaNote process={sw.process} />}

                        {/* 體重偏差 */}
                        <CalcField
                            label="體重偏差 (kg):"
                            value={wd.value !== null ? `${wd.value > 0 ? '+' : ''}${wd.value.toFixed(1)} kg` : '請輸入體重'}
                            hint={wd.formula}
                            valueStyle={{ color: wd.value > 4 ? '#d9534f' : wd.value < -4 ? '#5bc0de' : '#666' }}
                        />
                        {wd.process && <FormulaNote process={wd.process} />}

                        {/* 體重偏差高度調整 */}
                        <CalcField
                            label="體重偏差高度調整 (cm):"
                            value={weightDeviation !== null ? `${ha.value > 0 ? '+' : ''}${ha.value.toFixed(1)} cm` : '請輸入體重'}
                            hint={ha.formula}
                            valueStyle={{ color: ha.value > 0 ? '#d9534f' : ha.value < 0 ? '#5bc0de' : '#666' }}
                        />
                        {ha.process && <FormulaNote process={ha.process} />}

                        {/* 最終基準高度 */}
                        <CalcField
                            label="最終基準高度 (cm):"
                            value={fh.value !== null ? `${fh.value} cm` : '請輸入年齡、身高、性別、體重'}
                            hint={fh.formula}
                            highlight={fh.value !== null}
                            valueStyle={fh.value === null ? { color: '#999' } : {}}
                        />
                        {fh.process && <FormulaNote process={fh.process} />}

                        {/* 8 歲以下分高低處墊片（純文字） */}
                        {underEightNote && (
                            <div className={style.CreateEditProductRow}>
                                <label>8 歲以下分高低處墊片:</label>
                                <small style={{ color: '#666' }}>{underEightNote}</small>
                            </div>
                        )}
                    </div>
                );
            })()}

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
                    }}
                >
                    更新頸部分析
                </button>
            )}

            {(() => {
                const pillow = describePillowType(spinePoint24Distance); // 對應枕型

                return (
                    <div className={style.CreateEditProductContainer}>
                        <h2>枕骨七頸椎對應枕型</h2>
                        <div className={style.CreateEditProductRow}>
                            <small style={{ color: '#999', fontStyle: 'italic', marginBottom: '10px', display: 'block' }}>
                                ※ 依照[頸椎分析]之點2-4距離（枕骨至第七頸椎的距離）推薦適合的枕頭型號，數據自動從最新頸椎分析提取。
                            </small>
                        </div>

                        {/* 2-4 點距離 */}
                        <CalcField
                            label="點2-4距離 (cm):"
                            value={spinePoint24Distance !== null ? `${spinePoint24Distance.toFixed(2)} cm` : '無頸椎分析數據'}
                            hint="(枕骨至第七頸椎的距離)"
                        />

                        {/* 對應枕型 */}
                        <CalcField
                            label="對應枕型:"
                            value={pillow.value || '無推薦'}
                            hint={pillow.formula}
                            valueStyle={{ color: pillow.value ? '#5cb85c' : '#666', fontWeight: pillow.value ? 'bold' : 'normal' }}
                        />
                        {spinePoint24Distance !== null && <FormulaNote process={pillow.process} />}

                        {/* A / B 型枕墊片高低處（純文字） */}
                        <div className={style.CreateEditProductRow}>
                            <label></label>
                            <small style={{ color: '#666' }}>
                                A 型枕墊片會位於低處；B 型枕墊片會位於高處。
                            </small>
                        </div>
                    </div>
                );
            })()}

            {(() => {
                const shim = describeShimAdjustment(spinePoint37Distance, defaultHeight); // 墊片配置
                const modelLabel = baseHeight !== null && shim.modelSuffix
                    ? `型號後綴 ${shim.modelSuffix}`
                    : null;

                return (
                    <div className={style.CreateEditProductContainer}>
                        <h2>頸凹點至後腦勺增加墊片</h2>

                        {/* 點3-7 距離（頸椎凹點至後腦勺） */}
                        <CalcField
                            label="點3-7 距離 (cm):"
                            value={spinePoint37Distance !== null ? `${spinePoint37Distance.toFixed(2)} cm` : '無頸椎分析數據'}
                            hint="(頸椎凹點至後腦勺)"
                        />

                        {/* 墊片配置（依點3-7距離與最終基準高度是否為 .5） */}
                        <CalcField
                            label="墊片配置:"
                            value={shim.value
                                ? shim.value + (modelLabel ? `　→　${modelLabel}` : '')
                                : '無頸椎分析數據'}
                            hint={shim.formula}
                            valueStyle={{
                                color: shim.modelSuffix && shim.modelSuffix !== '.0' ? '#d9534f' : '#5cb85c',
                                fontWeight: shim.modelSuffix && shim.modelSuffix !== '.0' ? 'bold' : 'normal',
                                minWidth: '300px',
                            }}
                        />
                        {spinePoint37Distance !== null && <FormulaNote process={shim.process} />}
                    </div>
                );
            })()}

            {(() => {
                const ratio = describeStandardLengthRatio(height);    // 標準長比差
                const level = describeLevel58(spinePoint58Distance, height); // .5 級距

                return (
                    <div className={style.CreateEditProductContainer}>
                        <h2>頸凹點至背凸點級距</h2>

                        {/* 點5-8 距離（頸椎凹點至背部凸點） */}
                        <CalcField
                            label="點5-8 距離 (cm):"
                            value={spinePoint58Distance !== null ? `${spinePoint58Distance.toFixed(2)} cm` : '無頸椎分析數據'}
                            hint="(頸椎凹點至背部凸點)"
                        />

                        {/* 標準長度（固定 10 cm） */}
                        <CalcField
                            label="標準長度 (cm):"
                            value={`${STANDARD_LENGTH_58.toFixed(0)} cm`}
                            hint="固定 10 cm"
                        />

                        {/* 標準長比差 */}
                        <CalcField
                            label="標準長比差 (cm):"
                            value={ratio.value !== null ? `${ratio.value.toFixed(2)} cm` : '請輸入身高'}
                            hint={ratio.formula}
                        />
                        {ratio.process && <FormulaNote process={ratio.process} />}

                        {/* .5 級距（純文字顯示，不影響墊片與命名） */}
                        <CalcField
                            label=".5 級距 (cm):"
                            value={level.value !== null ? `${level.value} cm` : (ratio.value === null ? '請輸入身高' : '無頸椎分析數據')}
                            hint={level.formula}
                            valueStyle={{ color: level.value > 0 ? '#d9534f' : '#5cb85c', fontWeight: level.value > 0 ? 'bold' : 'normal' }}
                        />
                        {level.process && <FormulaNote process={level.process} />}
                        <div className={style.CreateEditProductRow}>
                            <label></label>
                            <small style={{ color: '#999', fontStyle: 'italic' }}>
                                ※ .5 級距結果（0.5、1、1.5、2 …）僅純文字顯示，不影響墊片與型號命名。
                            </small>
                        </div>
                    </div>
                );
            })()}

            {/* ── 型號建議 ─────────────────────────── */}
            {(() => {
                const shimAdj = computeShimAdjustment(spinePoint37Distance, defaultHeight);
                const { heightDigit, shimDigit, fParam, arcCode, modelName } = composeModelName({
                    finalHeight: defaultHeight,
                    shimAdj,
                    pillowRecommendation: spinePillowRecommendation,
                });

                return (
                    <div className={style.CreateEditProductContainer}>
                        <h2>型號命名建議</h2>
                        <div className={style.CreateEditProductRow}>
                            <small style={{ color: '#999', fontStyle: 'italic', marginBottom: '10px', display: 'block' }}>
                                ※ 命名格式：高度.墊片 + 弧度型號（範例：8.5FAA、7.2B、9.0A、8.5FA）
                            </small>
                        </div>

                        {/* 高度：最終基準高度的第一個數字 */}
                        <CalcField
                            label="高度:"
                            value={heightDigit ?? '請輸入年齡及身高'}
                            hint={`[最終基準高度] 的第一個數字（最終基準高度 = ${defaultHeight ?? '未計算'} cm）`}
                        />

                        {/* 墊片：.5 / .2 / .0 */}
                        <CalcField
                            label="墊片:"
                            value={shimDigit !== null ? `.${shimDigit}` : '無頸椎分析數據'}
                            hint={`依點3-7距離 ${spinePoint37Distance ? `${spinePoint37Distance.toFixed(2)} cm` : '未測量'} 的墊片配置`}
                        />

                        {/* F：墊片為 .5 時加入 */}
                        <CalcField
                            label="F 參數:"
                            value={shimDigit !== null ? (fParam || '（無）') : '無頸椎分析數據'}
                            hint="若墊片為 .5 則增加 F 參數"
                        />

                        {/* 弧度型號：A / B / AA */}
                        <CalcField
                            label="弧度型號:"
                            value={arcCode ?? '無頸椎分析數據'}
                            hint={`依點2-4距離 ${spinePoint24Distance ? `${spinePoint24Distance.toFixed(2)} cm` : '未測量'} 判定 A / B / AA`}
                        />

                        {/* 型號命名（組合結果） */}
                        <CalcField
                            label="型號命名:"
                            value={modelName ?? '資料不完整，請確認上方四項數值'}
                            hint="(組合格式：高度.墊片[+F]弧度型號)"
                            highlight={!!modelName}
                            valueStyle={modelName
                                ? { minWidth: '320px', fontSize: '1.05em' }
                                : { color: '#999', minWidth: '320px', fontSize: '1.05em' }}
                        />
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
                                    <strong style={{ color: '#2e7d32' }}>命名組合：</strong>
                                    {heightDigit}（高度）+ .{shimDigit}（墊片）{fParam && '+ F'} + {arcCode}（弧度）
                                    {' = '}
                                    <strong>{modelName}</strong>
                                    <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
                                        <li><strong>高度 ({heightDigit})</strong>：最終基準高度 {defaultHeight ?? '?'} cm 的第一個數字</li>
                                        <li><strong>墊片 (.{shimDigit}{fParam}) </strong>：依點3-7距離 {spinePoint37Distance ? `${spinePoint37Distance.toFixed(2)} cm` : '未測量'} 判定</li>
                                        <li><strong>弧度型號 ({arcCode})</strong>：依點2-4距離 {spinePoint24Distance ? `${spinePoint24Distance.toFixed(2)} cm` : '未測量'} 判定</li>
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

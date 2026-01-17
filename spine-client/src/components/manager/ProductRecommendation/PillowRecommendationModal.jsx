import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PillowRecommendationModal.module.css';

/**
 * 枕頭推薦彈窗元件
 * 根據客戶年齡推薦適合的枕頭型號
 * 
 * 推薦規則：
 * - 0～2歲、或 3～4歲 推薦 型號:【嬰兒枕】型號Ｂ
 * - 5～6歲、或 7～8歲 推薦 型號:【兒童枕】型號Ｃ
 */
function PillowRecommendationModal({ isOpen, onClose, customerData }) {
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);

    useEffect(() => {
        if (isOpen && customerData) {
            const result = generateRecommendation(customerData.age);
            setRecommendation(result);
        }
    }, [isOpen, customerData]);

    /**
     * 根據年齡獲取推薦結果
     */
    const getRecommendationByAge = (age) => {
        const ageNum = parseInt(age, 10);
        
        if (isNaN(ageNum) || ageNum < 0) {
            return { 
                model: '無法判斷', 
                description: '無法取得有效的年齡數值，請確認客戶年齡已填寫', 
                color: '#999',
                canPurchase: false
            };
        }

        // 0～2歲、或 3～4歲 推薦 型號:【嬰兒枕】型號Ｂ
        if (ageNum >= 0 && ageNum <= 4) {
            return { 
                model: '【嬰兒枕】型號Ｂ', 
                description: `年齡 ${ageNum} 歲，在 0～4歲 範圍內，建議使用【嬰兒枕】型號Ｂ`,
                color: '#FF9800',
                canPurchase: true,
                searchModel: '型號Ｂ'
            };
        }
        
        // 5～6歲、或 7～8歲 推薦 型號:【兒童枕】型號Ｃ
        if (ageNum >= 5 && ageNum <= 8) {
            return { 
                model: '【兒童枕】型號Ｃ', 
                description: `年齡 ${ageNum} 歲，在 5～8歲 範圍內，建議使用【兒童枕】型號Ｃ`,
                color: '#4CAF50',
                canPurchase: true,
                searchModel: '型號Ｃ'
            };
        }
        
        // 9歲以上無特別推薦
        return { 
            model: '無特別推薦', 
            description: `年齡 ${ageNum} 歲，超過推薦規則適用範圍（0～8歲），請依據個人需求選擇枕頭`,
            color: '#2196F3',
            canPurchase: true,
            searchModel: ''
        };
    };

    /**
     * 產生推薦結果
     */
    const generateRecommendation = (age) => {
        return getRecommendationByAge(age);
    };

    /**
     * 處理購買枕頭商品按鈕點擊
     */
    const handlePurchasePillow = () => {
        // 跳轉到枕頭商品推薦列表頁面，並傳遞客戶資料和推薦型號
        navigate('/manager/product-pillow-recommendation', { 
            state: { 
                customerData,
                fromCustomerPage: true,
                recommendedModel: recommendation?.searchModel || ''
            }
        });
        onClose();
    };

    if (!isOpen) return null;

    const customerAge = customerData?.age;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>推薦枕頭</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                
                <div className={styles.modalBody}>
                    <div className={styles.ruleDescription}>
                        <h4>推薦規則說明</h4>
                        <p>根據客戶 <strong>年齡</strong> 進行枕頭型號推薦：</p>
                        <ul>
                            <li>
                                <span className={styles.ageRange}>0～4歲</span>
                                <span className={styles.arrow}>→</span>
                                <span className={styles.rulePillow} style={{color: '#FF9800'}}>【嬰兒枕】型號Ｂ</span>
                            </li>
                            <li>
                                <span className={styles.ageRange}>5～8歲</span>
                                <span className={styles.arrow}>→</span>
                                <span className={styles.rulePillow} style={{color: '#4CAF50'}}>【兒童枕】型號Ｃ</span>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.customerInfo}>
                        <h4>客戶資訊</h4>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>客戶姓名：</span>
                            <span className={styles.infoValue}>{customerData?.name || '未知'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>客戶年齡：</span>
                            <span className={styles.infoValue}>
                                {customerAge !== undefined && customerAge !== '' ? `${customerAge} 歲` : '未填寫'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.recommendationResult}>
                        <h4>推薦結果</h4>
                        
                        {!customerAge && customerAge !== 0 ? (
                            <div className={styles.noResults}>
                                <p>此客戶尚未填寫年齡，無法進行枕頭推薦。</p>
                                <p>請先填寫客戶年齡後再使用此功能。</p>
                            </div>
                        ) : recommendation ? (
                            <div className={styles.resultItem}>
                                <div className={styles.recommendationInfo}>
                                    <span 
                                        className={styles.pillowRecommendation}
                                        style={{ backgroundColor: recommendation.color }}
                                    >
                                        {recommendation.model}
                                    </span>
                                    <p className={styles.recommendationDesc}>
                                        {recommendation.description}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.noResults}>
                                <p>無法產生推薦結果。</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    {recommendation?.canPurchase && (
                        <button 
                            className={styles.purchaseButton} 
                            onClick={handlePurchasePillow}
                        >
                            購買枕頭商品
                        </button>
                    )}
                    <button className={styles.confirmButton} onClick={onClose}>
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PillowRecommendationModal;

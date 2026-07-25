import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MattressRecommendationModal.module.css';

/**
 * 床墊推薦彈窗元件
 * 根據客戶的尾椎分析結果(123角度)推薦適合的床墊
 * 
 * 推薦規則：
 * - 0至3度：四號床
 * - 4度至7度：三號床
 * - 8度至11度：二號床
 * - 12度至13度：一號床
 * - 14度以上：一號床，再加厚1公分
 */
function MattressRecommendationModal({ isOpen, onClose, customerData }) {
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);
    const [latestTailAnalysis, setLatestTailAnalysis] = useState(null);

    useEffect(() => {
        if (isOpen && customerData) {
            const tailAnalysis = findLatestTailAnalysis(customerData.analysisResults);
            setLatestTailAnalysis(tailAnalysis);
            
            if (tailAnalysis) {
                const angle = extract123Angle(tailAnalysis);
                const result = getRecommendationByAngle(angle);
                setRecommendation(result);
            } else {
                setRecommendation(null);
            }
        }
    }, [isOpen, customerData]);

    /**
     * 從分析結果中找到最新的尾椎分析
     */
    const findLatestTailAnalysis = (analysisResults) => {
        if (!analysisResults || !Array.isArray(analysisResults)) {
            return null;
        }
        
        // 篩選出尾椎分析結果
        const tailAnalyses = analysisResults.filter(r => r.analysisType === 'tail');
        
        if (tailAnalyses.length === 0) {
            return null;
        }
        
        // 依照日期排序，取最新的一筆
        const sorted = tailAnalyses.sort((a, b) => {
            const dateA = getAnalysisDate(a);
            const dateB = getAnalysisDate(b);
            return dateB - dateA;
        });
        
        return sorted[0];
    };

    /**
     * 取得分析結果的日期
     */
    const getAnalysisDate = (result) => {
        const rawValue =
            result.createdAt ||
            result.createAt ||
            result.createdDate ||
            result.createDate ||
            result.createdTime ||
            result.createTime ||
            result.analysisData?.timestamp;

        if (!rawValue) return 0;

        try {
            if (typeof rawValue === 'number') {
                return rawValue > 1e12 ? rawValue : rawValue * 1000;
            } else if (typeof rawValue === 'string') {
                return new Date(rawValue.replace(' ', 'T')).getTime();
            } else if (rawValue instanceof Date) {
                return rawValue.getTime();
            }
        } catch {
            return 0;
        }
        return 0;
    };

    /**
     * 從分析結果中提取123角度值
     * 123角度 = 腰椎最凹處到薦椎底的直線與垂直線的夾角
     */
    const extract123Angle = (result) => {
        if (!result.calculationResults || !Array.isArray(result.calculationResults)) {
            return null;
        }
        
        // 尋找包含 "123" 角度的計算結果
        for (const calc of result.calculationResults) {
            // 匹配 "∠123 夾角：XX.XX°" 格式 (尾椎分析的實際格式)
            const tailAngleMatch = calc.match(/∠123\s*夾角[：:]\s*([\d.]+)/);
            if (tailAngleMatch) {
                return parseFloat(tailAngleMatch[1]);
            }
            
            // 匹配 "123角度" 或 "1-2-3角度" 或 "點1-2-3角度" 等格式
            const angleMatch = calc.match(/(?:點)?1[-]?2[-]?3[角度︰:\s]*[：:]*\s*([\d.]+)/);
            if (angleMatch) {
                return parseFloat(angleMatch[1]);
            }
            
            // 也嘗試匹配 "角度123" 或類似格式
            const altMatch = calc.match(/角度\s*1[-]?2[-]?3[︰:\s]*[：:]*\s*([\d.]+)/);
            if (altMatch) {
                return parseFloat(altMatch[1]);
            }
            
            // 匹配 "∠點1-點2-點3" 格式
            const pointAngleMatch = calc.match(/∠點1[-]?點2[-]?點3[：:]\s*([\d.]+)/);
            if (pointAngleMatch) {
                return parseFloat(pointAngleMatch[1]);
            }
        }
        return null;
    };

    /**
     * 根據角度獲取推薦結果
     */
    const getRecommendationByAngle = (angle) => {
        if (angle === null || isNaN(angle)) {
            return { 
                bed: '無法判斷', 
                description: '無法取得有效的角度數值，請確認客戶已有尾椎分析結果', 
                color: '#999',
                canPurchase: false,
                searchModel: ''
            };
        }

        if (angle >= 0 && angle <= 3) {
            return { 
                bed: '四號床', 
                description: `角度 ${angle.toFixed(1)}° 在 0°~3° 範圍內，建議使用四號床`,
                color: '#4CAF50',
                canPurchase: true,
                searchModel: '四號'
            };
        } else if (angle >= 4 && angle <= 7) {
            return { 
                bed: '三號床', 
                description: `角度 ${angle.toFixed(1)}° 在 4°~7° 範圍內，建議使用三號床`,
                color: '#2196F3',
                canPurchase: true,
                searchModel: '三號'
            };
        } else if (angle >= 8 && angle <= 11) {
            return { 
                bed: '二號床', 
                description: `角度 ${angle.toFixed(1)}° 在 8°~11° 範圍內，建議使用二號床`,
                color: '#FF9800',
                canPurchase: true,
                searchModel: '二號'
            };
        } else if (angle >= 12 && angle <= 13) {
            return { 
                bed: '一號床', 
                description: `角度 ${angle.toFixed(1)}° 在 12°~13° 範圍內，建議使用一號床`,
                color: '#9C27B0',
                canPurchase: true,
                searchModel: '一號'
            };
        } else if (angle >= 14) {
            return { 
                bed: '一號床 + 加厚1公分', 
                description: `角度 ${angle.toFixed(1)}° 超過 14°，建議使用一號床，並加厚1公分`,
                color: '#F44336',
                canPurchase: true,
                searchModel: '一號'
            };
        }
        
        return { 
            bed: '無法判斷', 
            description: `角度 ${angle.toFixed(1)}° 不在有效範圍內`, 
            color: '#999',
            canPurchase: false,
            searchModel: ''
        };
    };

    /**
     * 格式化分析日期
     */
    const formatAnalysisDate = (result) => {
        const rawValue =
            result.createdAt ||
            result.createAt ||
            result.createdDate ||
            result.createDate ||
            result.createdTime ||
            result.createTime ||
            result.analysisData?.timestamp;

        if (!rawValue) return '未知日期';

        try {
            let date;
            if (typeof rawValue === 'number') {
                const numericValue = rawValue > 1e12 ? rawValue : rawValue * 1000;
                date = new Date(numericValue);
            } else if (typeof rawValue === 'string') {
                date = new Date(rawValue.replace(' ', 'T'));
            } else if (rawValue instanceof Date) {
                date = rawValue;
            }

            if (date && !isNaN(date.getTime())) {
                return date.toLocaleString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch {
            // 忽略解析錯誤
        }
        return '未知日期';
    };

    /**
     * 處理購買床墊商品按鈕點擊
     */
    const handlePurchaseMattress = () => {
        // 跳轉到床墊商品推薦列表頁面，並傳遞客戶資料和推薦型號
        navigate('/manager/product-mattress-recommendation', { 
            state: { 
                customerData,
                fromCustomerPage: true,
                recommendedModel: recommendation?.searchModel || ''
            }
        });
        onClose();
    };

    if (!isOpen) return null;

    const tailAnalysisCount = customerData?.analysisResults?.filter(r => r.analysisType === 'tail').length || 0;
    const angle = latestTailAnalysis ? extract123Angle(latestTailAnalysis) : null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>推薦床墊</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                
                <div className={styles.modalBody}>
                    <div className={styles.ruleDescription}>
                        <h4>推薦規則說明</h4>
                        <p>根據 <strong>腰椎最凹處到薦椎底的直線與垂直線的夾角</strong>（尾椎分析的123角度）進行床墊推薦：</p>
                        <ul>
                            <li>
                                <span className={styles.angleRange}>0° ~ 3°</span>
                                <span className={styles.arrow}>→</span>
                                <span className={styles.ruleBed} style={{color: '#4CAF50'}}>四號床</span>
                            </li>
                            <li>
                                <span className={styles.angleRange}>4° ~ 7°</span>
                                <span className={styles.arrow}>→</span>
                                <span className={styles.ruleBed} style={{color: '#2196F3'}}>三號床</span>
                            </li>
                            <li>
                                <span className={styles.angleRange}>8° ~ 11°</span>
                                <span className={styles.arrow}>→</span>
                                <span className={styles.ruleBed} style={{color: '#FF9800'}}>二號床</span>
                            </li>
                            <li>
                                <span className={styles.angleRange}>12° ~ 13°</span>
                                <span className={styles.arrow}>→</span>
                                <span className={styles.ruleBed} style={{color: '#9C27B0'}}>一號床</span>
                            </li>
                            <li>
                                <span className={styles.angleRange}>14° 以上</span>
                                <span className={styles.arrow}>→</span>
                                <span className={styles.ruleBed} style={{color: '#F44336'}}>一號床 + 加厚1公分</span>
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
                            <span className={styles.infoLabel}>尾椎分析數：</span>
                            <span className={styles.infoValue}>{tailAnalysisCount} 筆</span>
                        </div>
                        {latestTailAnalysis && (
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>最新分析日期：</span>
                                <span className={styles.infoValue}>{formatAnalysisDate(latestTailAnalysis)}</span>
                            </div>
                        )}
                        {angle !== null && (
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>123角度：</span>
                                <span className={styles.infoValue}>{angle.toFixed(1)}°</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.recommendationResult}>
                        <h4>推薦結果</h4>
                        
                        {tailAnalysisCount === 0 ? (
                            <div className={styles.noResults}>
                                <p>此客戶尚無尾椎分析結果，無法進行床墊推薦。</p>
                                <p>請先為客戶進行尾椎分析後再使用此功能。</p>
                            </div>
                        ) : recommendation ? (
                            <div className={styles.resultItem}>
                                <div className={styles.recommendationInfo}>
                                    <span 
                                        className={styles.bedRecommendation}
                                        style={{ backgroundColor: recommendation.color }}
                                    >
                                        {recommendation.bed}
                                    </span>
                                    <p className={styles.recommendationDesc}>
                                        {recommendation.description}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.noResults}>
                                <p>無法從分析結果中取得有效的123角度數值。</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    {recommendation?.canPurchase && (
                        <button 
                            className={styles.purchaseButton} 
                            onClick={handlePurchaseMattress}
                        >
                            購買床墊商品
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

export default MattressRecommendationModal;

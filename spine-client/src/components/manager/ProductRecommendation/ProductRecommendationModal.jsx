import React, { useState, useEffect } from 'react';
import styles from './ProductRecommendationModal.module.css';

/**
 * 推薦商品彈窗元件
 * 根據客戶的尾椎分析結果(123角度)推薦適合的床墊
 * 
 * 推薦規則：
 * - 0至3度：四號床
 * - 4度至7度：三號床
 * - 8度至11度：二號床
 * - 12度至13度：一號床
 * - 14度以上：一號床，再加厚1公分
 */
function ProductRecommendationModal({ isOpen, onClose, analysisResults }) {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        if (isOpen && analysisResults && analysisResults.length > 0) {
            const results = generateRecommendations(analysisResults);
            setRecommendations(results);
        }
    }, [isOpen, analysisResults]);

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
            return { bed: '無法判斷', description: '無法取得有效的角度數值', color: '#999' };
        }

        if (angle >= 0 && angle <= 3) {
            return { 
                bed: '四號床', 
                description: `角度 ${angle.toFixed(1)}° 在 0°~3° 範圍內，建議使用四號床`,
                color: '#4CAF50'
            };
        } else if (angle >= 4 && angle <= 7) {
            return { 
                bed: '三號床', 
                description: `角度 ${angle.toFixed(1)}° 在 4°~7° 範圍內，建議使用三號床`,
                color: '#2196F3'
            };
        } else if (angle >= 8 && angle <= 11) {
            return { 
                bed: '二號床', 
                description: `角度 ${angle.toFixed(1)}° 在 8°~11° 範圍內，建議使用二號床`,
                color: '#FF9800'
            };
        } else if (angle >= 12 && angle <= 13) {
            return { 
                bed: '一號床', 
                description: `角度 ${angle.toFixed(1)}° 在 12°~13° 範圍內，建議使用一號床`,
                color: '#9C27B0'
            };
        } else if (angle >= 14) {
            return { 
                bed: '一號床 + 加厚1公分', 
                description: `角度 ${angle.toFixed(1)}° 超過 14°，建議使用一號床，並加厚1公分`,
                color: '#F44336'
            };
        }
        
        return { bed: '無法判斷', description: `角度 ${angle.toFixed(1)}° 不在有效範圍內`, color: '#999' };
    };

    /**
     * 解析分析日期
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
     * 產生所有分析結果的推薦
     */
    const generateRecommendations = (results) => {
        const recommendations = [];
        
        results.forEach((result, index) => {
            // 只處理尾椎分析
            if (result.analysisType !== 'tail') {
                return;
            }

            const angle = extract123Angle(result);
            const recommendation = getRecommendationByAngle(angle);
            const dateStr = formatAnalysisDate(result);

            recommendations.push({
                index: index + 1,
                analysisType: '尾椎分析',
                date: dateStr,
                angle: angle,
                recommendation: recommendation
            });
        });

        return recommendations;
    };

    if (!isOpen) return null;

    const tailAnalysisCount = analysisResults?.filter(r => r.analysisType === 'tail').length || 0;

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
                            <li><span className={styles.ruleBed} style={{color: '#4CAF50'}}>四號床</span>：夾角 0° ~ 3°</li>
                            <li><span className={styles.ruleBed} style={{color: '#2196F3'}}>三號床</span>：夾角 4° ~ 7°</li>
                            <li><span className={styles.ruleBed} style={{color: '#FF9800'}}>二號床</span>：夾角 8° ~ 11°</li>
                            <li><span className={styles.ruleBed} style={{color: '#9C27B0'}}>一號床</span>：夾角 12° ~ 13°</li>
                            <li><span className={styles.ruleBed} style={{color: '#F44336'}}>一號床 + 加厚1公分</span>：夾角 14° 以上</li>
                        </ul>
                    </div>

                    <div className={styles.recommendationList}>
                        <h4>客戶分析結果與推薦</h4>
                        
                        {tailAnalysisCount === 0 ? (
                            <div className={styles.noResults}>
                                <p>此客戶尚無尾椎分析結果，無法進行床墊推薦。</p>
                                <p>請先為客戶進行尾椎分析後再使用此功能。</p>
                            </div>
                        ) : recommendations.length === 0 ? (
                            <div className={styles.noResults}>
                                <p>無法從分析結果中取得有效的123角度數值。</p>
                            </div>
                        ) : (
                            <div className={styles.resultsList}>
                                {recommendations.map((rec, idx) => (
                                    <div key={idx} className={styles.recommendationItem}>
                                        <div className={styles.itemHeader}>
                                            <span className={styles.itemIndex}>第 {rec.index} 筆分析</span>
                                            <span className={styles.itemType}>{rec.analysisType}</span>
                                            <span className={styles.itemDate}>{rec.date}</span>
                                        </div>
                                        <div className={styles.itemBody}>
                                            <div className={styles.angleInfo}>
                                                <span className={styles.angleLabel}>123角度：</span>
                                                <span className={styles.angleValue}>
                                                    {rec.angle !== null ? `${rec.angle.toFixed(1)}°` : '無法取得'}
                                                </span>
                                            </div>
                                            <div className={styles.recommendationInfo}>
                                                <span 
                                                    className={styles.bedRecommendation}
                                                    style={{ backgroundColor: rec.recommendation.color }}
                                                >
                                                    {rec.recommendation.bed}
                                                </span>
                                                <p className={styles.recommendationDesc}>
                                                    {rec.recommendation.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.confirmButton} onClick={onClose}>
                        確認
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductRecommendationModal;

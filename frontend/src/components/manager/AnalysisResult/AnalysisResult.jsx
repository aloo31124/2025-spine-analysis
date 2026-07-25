import React, { useState } from 'react';
import style from '../CreateEdit/CreateEdit.module.css';
import { deleteCustomerAnalysisResult, clearPendingAnalysisData } from '../../../api/manager/customerAnalysisResult';

function AnalysisResult({ analysisResults, onDeleteResult, isLoading = false }) {
    // 控制分析結果區塊的展開/收合狀態
    const [isSectionExpanded, setIsSectionExpanded] = useState(true);
    // 控制每筆分析結果的展開/收合狀態
    const [expandedResults, setExpandedResults] = useState({});
    const [deletingResults, setDeletingResults] = useState({});

    /* 切換整個分析結果區塊的展開/收合 */
    const toggleSectionExpansion = () => {
        setIsSectionExpanded(prev => !prev);
    };

    const getAnalysisTypeLabel = (analysisType) => {
        switch (analysisType) {
            case 'tail':
                return '尾椎分析';
            case 'spine':
                return '頸部分析';
            default:
                return '';
        }
    };

    const parseDateValue = (value) => {
        if (!value) return null;
        if (value instanceof Date) return value;

        if (typeof value === 'number') {
            const numericValue = value > 1e12 ? value : value * 1000;
            const dateFromNumber = new Date(numericValue);
            return Number.isNaN(dateFromNumber.getTime()) ? null : dateFromNumber;
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) return null;

            const normalized = trimmed.replace(' ', 'T');
            let parsed = new Date(normalized);

            if (Number.isNaN(parsed.getTime())) {
                const timeMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
                if (timeMatch) {
                    const [, year, month, day, hour, minute, second = '00'] = timeMatch;
                    parsed = new Date(
                        parseInt(year, 10),
                        parseInt(month, 10) - 1,
                        parseInt(day, 10),
                        parseInt(hour, 10),
                        parseInt(minute, 10),
                        parseInt(second, 10)
                    );
                }
            }

            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        return null;
    };

    const formatAnalysisDate = (result) => {
        if (!result) return '';

        // 從不同欄位推測分析建立時間，避免後端欄位命名不一致
        const rawValue =
            result.createdAt ||
            result.createAt ||
            result.createdDate ||
            result.createDate ||
            result.createdTime ||
            result.createTime ||
            result.analysisData?.timestamp;

        const parsedDate = parseDateValue(rawValue);
        if (!parsedDate) return '';

        return parsedDate.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /* 切換分析結果的展開/收合狀態 */
    const toggleResultExpansion = (index) => {
        setExpandedResults(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    /* 刪除分析結果 */
    const handleDeleteResult = async (result, index) => {
        if (!window.confirm('確定要刪除這筆分析結果嗎？')) {
            return;
        }

        try {
            setDeletingResults(prev => ({ ...prev, [index]: true }));
            
            // 如果有 id，則調用 API 刪除（已保存到資料庫的結果）
            if (result.id) {
                await deleteCustomerAnalysisResult(result.id);
            } else {
                // 如果沒有 id，表示是暫存的分析結果，從 localStorage 移除
                clearPendingAnalysisData();
            }
            
            // 通知父組件更新列表
            if (onDeleteResult) {
                onDeleteResult(result.id, index);
            }
            
            alert('刪除成功');
        } catch (error) {
            console.error('刪除分析結果失敗:', error);
            alert('刪除失敗，請稍後再試');
        } finally {
            setDeletingResults(prev => ({ ...prev, [index]: false }));
        }
    };

    return (
        <div className={style.AnalysisResultSection}>
            {/* 區塊標題與收合/展開按鈕 */}
            <div className={style.AnalysisSectionHeader} onClick={toggleSectionExpansion}>
                <span className={style.ExpandIcon}>{isSectionExpanded ? '▼' : '▶'}</span>
                <span className={style.SectionTitle}>
                    分析結果 {analysisResults && analysisResults.length > 0 ? `(${analysisResults.length})` : ''}
                </span>
            </div>
            
            {/* Loading 動畫 */}
            {isLoading && (
                <div className={style.LoadingContainer}>
                    <div className={style.LoadingSpinner}></div>
                    <p className={style.LoadingText}>載入分析結果中...</p>
                </div>
            )}
            
            {/* 分析結果內容 (非 loading 且展開時顯示) */}
            {!isLoading && isSectionExpanded && (
                <div className={style.CreateEditProductRow}>
                    {analysisResults && analysisResults.length > 0 ? (
                        <div className={style.AnalysisResultsContainer}>
                    {analysisResults.map((result, index) => {
                        const typeLabel = getAnalysisTypeLabel(result.analysisType);
                        const formattedDate = formatAnalysisDate(result);
                        const fallbackTitle = `分析記錄 #${index + 1}`;
                        const headerTitle = `${typeLabel || fallbackTitle}${formattedDate ? `｜${formattedDate}` : ''}`;

                        return (
                            <div key={result.id || index} className={style.AnalysisResultItem}>
                                <div className={style.ResultHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div 
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
                                            onClick={() => toggleResultExpansion(index)}
                                        >
                                            <span>{expandedResults[index] ? '▼' : '▶'}</span>
                                            <h4>{headerTitle}</h4>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteResult(result, index);
                                                }}
                                                disabled={deletingResults[index]}
                                                style={{
                                                    backgroundColor: '#ff4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '5px 10px',
                                                    cursor: deletingResults[index] ? 'not-allowed' : 'pointer',
                                                    fontSize: '12px',
                                                    opacity: deletingResults[index] ? 0.6 : 1
                                                }}
                                            >
                                                {deletingResults[index] ? '刪除中...' : '刪除'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {expandedResults[index] && (
                                    <div className={style.ResultContent}>
                                        {result.calculationResults && (
                                            <div className={style.CalculationResults}>
                                                <h5>計算結果:</h5>
                                                <ul>
                                                    {result.calculationResults.map((calc, calcIndex) => (
                                                        <li key={calcIndex}>{calc}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {result.points && (
                                            <div className={style.PointsData}>
                                                <h5>標記點位:</h5>
                                                <div className={style.PointsList}>
                                                    {result.points.map((point, pointIndex) => (
                                                        <span key={pointIndex} className={style.PointItem}>
                                                            點{pointIndex + 1}: ({Math.round(point.x)}, {Math.round(point.y)})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* TODO: 暫時註解圖片顯示，待日後確認圖片顯示方式後再行處理 */}
                                        {/* {result.backgroundImage && (
                                            <div className={style.ImagePreview}>
                                                <h5>分析圖片:</h5>
                                                <img 
                                                    src={result.backgroundImage} 
                                                    alt="分析圖片" 
                                                    className={style.ResultImage}
                                                />
                                            </div>
                                        )} */}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                        </div>
                    ) : (
                        <div className={style.NoResults}>
                            <p>暫無分析結果</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AnalysisResult;

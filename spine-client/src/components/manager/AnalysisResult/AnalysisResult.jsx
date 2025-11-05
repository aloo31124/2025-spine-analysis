import React, { useState } from 'react';
import style from '../CreateEdit/CreateEdit.module.css';
import { deleteCustomerAnalysisResult } from '../../../api.spine/manager/customerAnalysisResult';

function AnalysisResult({ analysisResults, onDeleteResult }) {
    // 控制分析結果的展開/收合狀態
    const [expandedResults, setExpandedResults] = useState({});
    const [deletingResults, setDeletingResults] = useState({});

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
            
            // 如果有 id，則調用 API 刪除
            if (result.id) {
                await deleteCustomerAnalysisResult(result.id);
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
        <div className={style.CreateEditProductRow}>
            {analysisResults && analysisResults.length > 0 ? (
                <div className={style.AnalysisResultsContainer}>
                    {analysisResults.map((result, index) => (
                        <div key={result.id || index} className={style.AnalysisResultItem}>
                            <div className={style.ResultHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div 
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
                                        onClick={() => toggleResultExpansion(index)}
                                    >
                                        <span>{expandedResults[index] ? '▼' : '▶'}</span>
                                        <h4>分析記錄 #{index + 1}</h4>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className={style.ResultDate}>
                                            {new Date(result.createdAt).toLocaleString('zh-TW', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
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
                                    {result.backgroundImage && (
                                        <div className={style.ImagePreview}>
                                            <h5>分析圖片:</h5>
                                            <img 
                                                src={result.backgroundImage} 
                                                alt="分析圖片" 
                                                className={style.ResultImage}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className={style.NoResults}>
                    <p>暫無分析結果</p>
                </div>
            )}
        </div>
    );
}

export default AnalysisResult;

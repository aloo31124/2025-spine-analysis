import React, { useState } from 'react';
import style from '../CreateEdit/CreateEdit.module.css';

function AnalysisResult({ analysisResults }) {
    // 控制分析結果的展開/收合狀態
    const [expandedResults, setExpandedResults] = useState({});

    /* 切換分析結果的展開/收合狀態 */
    const toggleResultExpansion = (index) => {
        setExpandedResults(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <div className={style.CreateEditProductRow}>
            {analysisResults && analysisResults.length > 0 ? (
                <div className={style.AnalysisResultsContainer}>
                    {analysisResults.map((result, index) => (
                        <div key={result.id || index} className={style.AnalysisResultItem}>
                            <div 
                                className={style.ResultHeader}
                                onClick={() => toggleResultExpansion(index)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span>{expandedResults[index] ? '▼' : '▶'}</span>
                                        <h4>分析記錄 #{index + 1}</h4>
                                    </div>
                                    <span className={style.ResultDate}>
                                        {new Date(result.createdAt).toLocaleString('zh-TW', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
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

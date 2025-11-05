import React, { useEffect, useState } from 'react';
import style from './CreateEdit.module.css';

function CreateEditCustomer({typePage, customer, analysisResults, handleUpdateCustomer, handleAddCustomer}) {
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
    // 控制分析結果的展開/收合狀態
    const [expandedResults, setExpandedResults] = useState({});

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
        }
    }, [customer]);

    /* 切換分析結果的展開/收合狀態 */
    const toggleResultExpansion = (index) => {
        setExpandedResults(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    /* post 新增客戶 */
    const clickAddCustomer = async () => {
        if(typePage !== typePageList.CREATE) return;
        if (!name || !email || !phone) {
            alert('請填寫必要欄位：姓名、電子郵件、電話');
            return;
        }
        handleAddCustomer({name, email, phone, address, birthday, gender, state, notes});
    }

    /* 編輯客戶, 更新編輯客戶 */
    const clickUpdateCustomer = async () => {
        if(typePage !== typePageList.EDIT) return;
        if (!name || !email || !phone) {
            alert('請填寫必要欄位：姓名、電子郵件、電話');
            return;
        }
        handleUpdateCustomer({name, email, phone, address, birthday, gender, state, notes});
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
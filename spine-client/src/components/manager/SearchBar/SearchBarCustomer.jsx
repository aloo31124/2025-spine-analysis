import React, { useState, useEffect } from 'react';
import style from './SearchBar.module.css';

function SearchBarCustomer({ getSearchParam, pagingParam }) {
    const [keyword, setKeyword] = useState('');
    const [state, setState] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    // 搜尋客戶
    const handleSearch = () => {
        const searchParam = {
            keyword: keyword.trim(),
            state,
            phone: phone.trim(),
            email: email.trim()
        };
        getSearchParam(searchParam);
    };

    // 重置搜尋條件
    const handleReset = () => {
        setKeyword('');
        setState('');
        setPhone('');
        setEmail('');
        getSearchParam({
            keyword: '',
            state: '',
            phone: '',
            email: ''
        });
    };

    // Enter鍵觸發搜尋
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={style.SearchBarContainer}>
            <div className={style.SearchBarRow}>
                <input
                    type="text"
                    placeholder="搜尋客戶姓名或關鍵字"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <input
                    type="text"
                    placeholder="搜尋電子郵件"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            </div>
            <div className={style.SearchBarRow}>
                <input
                    type="text"
                    placeholder="搜尋電話"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            </div>
            <div className={style.SearchBarRow}>
                <button onClick={handleSearch}>搜尋</button>
                <button onClick={handleReset}>重置</button>
            </div>
            {pagingParam && (
                <div className={style.SearchBarRow}>
                    <span>共找到 {pagingParam.dataTotal || 0} 筆客戶資料</span>
                </div>
            )}
        </div>
    );
}

export default SearchBarCustomer;
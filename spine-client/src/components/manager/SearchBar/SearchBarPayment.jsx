import React, {useState, useRef, useEffect} from "react";
import style from "./SearchBar.module.css";
import CalendarPicker from '../../tools/CalendarPicker/CalendarPicker';
import { handleNumberInput } from '../../../utils/inputHelpers';

function SearchBarPayment({getSearchParam, pagingParam}) {
    // 搜尋欄位所有 搜尋條件設定為 元件狀態useState
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [interval, setInterval] = useState('');
    const [createDate, setCreateDate] = useState('');
    const [costMin, setCostMin] = useState('');
    const [costMax, setCostMax] = useState('');

    // 行事曆組件參數
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef(null);
    const inputRef = useRef(null);

    // 整理搜尋參數
    const clickSearchPayment = async () => {
        getSearchParam({
            name, type, interval, createDate,
            costRange: { min: costMin, max: costMax }
        });
    }

    // 監聽點選外部, 隱藏行事曆
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                calendarRef.current &&
                !calendarRef.current.contains(event.target) &&
                inputRef.current !== event.target
            ) {
                setShowCalendar(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={style.SearchBar}>
            <div className={style.SearchBarRow}>
                <input type="text" 
                    placeholder="方案名稱不限"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </div>
            <div className={style.SearchBarRow}>
                並且
                <select value={type} onChange={e => setType(e.target.value)}>
                    <option value="">類型不限</option>
                    <option value="basic">基本版</option>
                    <option value="premium">進階版</option>
                    <option value="enterprise">企業版</option>
                </select>
                
                並且
                <select value={interval} onChange={e => setInterval(e.target.value)}>
                    <option value="">週期不限</option>
                    <option value="monthly">月繳</option>
                    <option value="quarterly">季繳</option>
                    <option value="yearly">年繳</option>
                </select>

                {/* 暫時註解, 待 後端資料庫建立, 與 增改 資料綁定
                <div ref={calendarRef} 
                    className={style.CalendarWrapper}>
                    並且
                    <input type="text" 
                        placeholder="建立日期不限"
                        value={createDate}
                        onChange={e => setCreateDate(e.target.value)}
                        readOnly
                        onClick={() => setShowCalendar(true)}
                    />
                    {showCalendar && (
                        <div className={style.CalendarContainer}>
                            <CalendarPicker 
                                onSelectDate={(date) => {
                                    setCreateDate(date);
                                    setShowCalendar(false);
                                }} 
                            />
                        </div>
                    )}
                </div>
                */}

            </div>
            <div className={style.SearchBarRow}>
                並且 費用範圍
                <input type="text" 
                    placeholder="0"
                    value={costMin}
                    onChange={e => setCostMin(handleNumberInput(e.target.value, '費用下限'))}
                />
                ~
                <input type="text" 
                    placeholder="費用上限不限"
                    value={costMax}
                    onChange={e => setCostMax(handleNumberInput(e.target.value, '費用上限'))}
                />
            </div>
            <button onClick={clickSearchPayment}>搜尋</button>

        </div>
    )
}

export default SearchBarPayment;
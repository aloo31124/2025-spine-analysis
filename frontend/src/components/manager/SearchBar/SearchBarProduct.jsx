import React, {useState, useRef, useEffect} from "react";
import style from "./SearchBar.module.css";
import CategoryDialog from '../../dialog/CategoryDialog/CategoryDialog';
import CalendarPicker from '../../tools/CalendarPicker/CalendarPicker';
import { handleNumberInput } from '../../../utils/inputHelpers';

function SearchBarProduct({categoryList, getSearchParam, pagingParam}) {
    // 搜尋欄位所有 搜尋條件設定為 元件狀態useState
    const [keyword, setKeyword] = useState(null);
    const [state, setState] = useState(null);
    const [createDate, setCreateDate] = useState(null);
    const [priceMin, setPriceMin] = useState(null);
    const [priceMax, setPriceMax] = useState(null);
    // 商品分類
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [categoryId, setCategoryId] = useState("");

    // 行事曆組件參數
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef(null);
    const inputRef = useRef(null);

    // 整理搜尋參數
    const clickSearchProduct = async () => {
        getSearchParam({
            keyword, state, createDate, 
            categoryList: categoryList.map(c => ({...c, isSelected: c.id === categoryId})),
            priceRange:{min: priceMin, max: priceMax}
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
                <span className={style.SearchLabel}>商品名稱:</span>
                <input type="text" 
                    placeholder="商品名稱不限"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                />
            </div>
            <div className={style.SearchBarRow}>
                <span className={style.SearchLabel}>狀態:</span>
                <input type="text" 
                    placeholder="狀態不限"
                    value={state}
                    onChange={e => setState(e.target.value)}
                />
                
                {/* 暫時註解, 待 後端資料庫建立, 與 增改 資料綁定
                <div ref={calendarRef} 
                    className={style.CalendarWrapper}>
                    <span className={style.SearchLabel}>建立日期:</span>
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
                <span className={style.SearchLabel}>分類:</span>
                <input type="text" 
                    placeholder="分類不限"
                    value={categoryList.find(c => c.id === categoryId)?.name || ''}
                    onClick={() => setIsCategoryDialogOpen(true)} // 點擊時打開 Dialog
                    readOnly
                />

            </div>
            <div className={`${style.SearchBarRow} ${style.PriceRangeRow}`}>
                <span className={style.SearchLabel}>價格範圍:</span>
                <input type="text" 
                    placeholder="0"
                    value={priceMin}
                    onChange={e => setPriceMin(handleNumberInput(e.target.value, '價格下限'))}
                />
                <span className={style.SearchSeparator}>~</span>
                <input type="text" 
                    placeholder="價位上限不限"
                    value={priceMax}
                    onChange={e => setPriceMax(handleNumberInput(e.target.value, '價格上限'))}
                />
            </div>
            <div className={style.SearchBarRow}>
                <button onClick={clickSearchProduct}>搜尋</button>
            </div>

            
            {/* CategoryDialog 分類視窗 */}
            <CategoryDialog
                isOpen={isCategoryDialogOpen}
                onClose={() => setIsCategoryDialogOpen(false)}
                onSelect={setCategoryId}
                categoryList={categoryList}
            />

        </div>
    )
}

export default SearchBarProduct;

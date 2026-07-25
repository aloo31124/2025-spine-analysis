import React from 'react';
import style from './PaginationBar.module.css';

function PaginationBar({pagingParam, clickPageChange, clickPageSizeChange, isShowPotalSetting = true }) {
    // 檢查 pagingParam 參數符合如下格式 type
    // { pageIndex: 1, pageSize: 3, sort: 'name', pageTotal:8, dataTotal:87 }
    // 檢查 pagingParam 是否符合格式
    const isValidPagingParam =
        pagingParam &&
        typeof pagingParam.pageIndex === "number" &&
        typeof pagingParam.pageSize === "number" &&
        typeof pagingParam.pageTotal === "number" &&
        typeof pagingParam.dataTotal === "number" &&
        typeof pagingParam.sort === "string";

    if (!isValidPagingParam) {
        console.error("PaginationBar: pagingParam 格式錯誤", pagingParam);
        return <div className="pagination-error">分頁參數錯誤</div>;
    }

    // 處理頁碼切換
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagingParam.pageTotal) return;
        clickPageChange(newPage);
    }

    return (
        <div className={style.PaginationBarContainer}>
            <button onClick={() => handlePageChange(pagingParam.pageIndex - 1)} disabled={pagingParam.pageIndex === 1}>
                上一頁
            </button>
            {Array.from({ length: pagingParam.pageTotal }, (_, i) => (
                <button 
                    key={i + 1} 
                    onClick={() => handlePageChange(i + 1)}
                    style={{ fontWeight: pagingParam.pageIndex === i + 1 ? 'bold' : 'normal' }}
                >
                    {i + 1}
                </button>
            ))}
            <button onClick={() => handlePageChange(pagingParam.pageIndex + 1)} disabled={pagingParam.pageIndex === pagingParam.pageTotal}>
                下一頁
            </button>
            {/* 下拉選單 - 選擇每頁顯示數量 */}
            {isShowPotalSetting && (
                <div>
                    <span>每頁顯示：</span>
                    <select value={pagingParam.pageSize} onChange={clickPageSizeChange}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span> 總共 {pagingParam.dataTotal} 筆資料</span>
                </div>
            )}
            
        </div>
    );
}
export default PaginationBar;


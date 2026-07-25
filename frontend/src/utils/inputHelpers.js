/**
 * 處理輸入值的數字轉換
 * @param {string} value - 輸入的值
 * @param {string} fieldName - 欄位名稱，用於錯誤提示
 * @returns {number|string|null} - 如果是數字則返回number，空值返回null，其他返回原字符串
 */
export const handleNumberInput = (value, fieldName = '此欄位') => {
    if (value === '' || value === null) {
        //alert(`${fieldName}值為 null或空白`); // backspace, delete 會觸發這個情況
        return null;
    } else if (!isNaN(value) && !isNaN(parseFloat(value))) {
        return Number(value);
    } else {
        alert(`${fieldName}請輸入有效的數字`);
        return '';
    }
};

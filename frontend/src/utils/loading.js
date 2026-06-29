/**
 * 包裝一個 promise，統一管理 loading 狀態、最小顯示時間、超時提示
 * @param {Promise} promise - 要執行的 API promise
 * @param {Object} options - 設定參數
 * @param {number} options.min - 最小 loading 顯示時間 (毫秒)，預設 0
 * @param {number} options.timeout - 最長等待時間 (毫秒)，預設 5000
 * @param {Function} options.onLoading - 進入 loading 狀態時執行 (如 setIsLoading(true))
 * @param {Function} options.onLoaded - 結束 loading 狀態時執行 (如 setIsLoading(false))
 * @param {Function} options.onTimeout - 超時時執行 (如 alert 提示)
 * @returns {Promise<any>} - API 結果
 */
export async function withLoading(promise, { min = 0, timeout = 5000, onLoading, onLoaded, onTimeout }) {
    // 1. 進入 loading 狀態
    onLoading?.();
    let timeoutId;
    // 2. 建立 timeoutPromise，timeout 毫秒後觸發 reject('timeout')
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('timeout')), timeout);
    });
    // 3. 記錄開始時間
    const start = Date.now(); 
    try {
        // 4. API 與 timeout 競速，誰先完成用誰的結果
        const result = await Promise.race([promise, timeoutPromise]);
        // 5. API 回應，清除 timeout
        clearTimeout(timeoutId); 
        // 6. 計算已花費時間
        const elapsed = Date.now() - start; 
        // 7. 若小於 min，補足剩餘時間，確保 loading 至少 min 毫秒
        if (elapsed < min) await new Promise(r => setTimeout(r, min - elapsed));
        onLoaded?.(); // 8. 結束 loading 狀態
        return result; // 9. 回傳 API 結果
    } catch (e) {
        clearTimeout(timeoutId); // 10. 發生錯誤或 timeout，清除 timeout
        onLoaded?.(); // 11. 結束 loading 狀態
        if (e.message === 'timeout') onTimeout?.(); // 12. 若是 timeout，執行超時 callback
        else throw e; // 13. 其他錯誤往外丟
    }
}

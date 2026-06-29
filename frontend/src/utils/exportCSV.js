
/** 匯出 , json 轉 csv */
export function exportJsonToCsv(filename, data) {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // 取得 CSV 標頭欄位
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // 組成表頭
    csvRows.push(headers.join(','));

    // 組成每一筆資料
    for (const row of data) {
        const values = headers.map(header => {
            let val = row[header] ?? '';
            // 避免逗號破壞格式，處理字串包含引號或換行
            val = typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
            return val;
        });
        csvRows.push(values.join(','));
    }

    // 轉成 UTF-8 BOM 編碼，加上 BOM 前綴以支援 Excel 顯示中文
    const csvString = '\uFEFF' + csvRows.join('\n');

    // 建立 Blob 並觸發下載
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '.csv';
    link.click();

    URL.revokeObjectURL(url);
}

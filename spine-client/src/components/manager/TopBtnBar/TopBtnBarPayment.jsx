import React from "react";
import style from "../../../pages/manager/manager.module.css";
import { useNavigate } from "react-router-dom";
import { importPayment } from "../../../api/manager/payment";

/* 後台管理, 上方功能bar - 方案管理 */
function TopBtnBarPayment({paymentList}) {
    const navigate = useNavigate();

    const clickAddPayment = () => {
        navigate("/manager/payment/add");
    }

    // 將 paymentList 轉為 CSV 字串
    const convertToCSV = (data) => {
        if (!data.length) return '';
        // 取得欄位標題
        const headers = Object.keys(data[0]).join(',') + '\n';
        // 取得每行資料
        const rows = data
            .map(item => Object.values(item).join(','))
            .join('\n');
        return headers + rows;
    };

    /* 匯出方案為 csv 檔 */
    const clickExportPayment = () => {
        if (!paymentList || paymentList.length === 0) {
            alert('無方案可匯出');
            return;
        }

        // 1. 轉換 CSV
        const csvContent = convertToCSV(paymentList);
        // 2. 加上 BOM (防止 Excel 中文亂碼)
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        // 3. 建立下載 a 標籤
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment_list_${new Date().toISOString().slice(0, 10)}.csv`;  
        // 4. 自動觸發下載
        document.body.appendChild(a);
        a.click();
        // 5. 清除資源
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /* 匯入方案 
        將 csv 檔轉為 json 格式
    */
    const clickImportPayment = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                const text = e.target.result;
                const rows = text.split('\n');
                const headers = rows[0].split(',');
                const payments = rows.slice(1).map(row => {
                    console.log('row:', row);
                    const values = row.split(',');
                    const payment = {};
                    headers.forEach((header, i) => {
                        values[i] = values[i].replace("\r", '');
                        if(values[i].trim().length === 0) return;
                        if(header.trim().length === 0) return;
                        payment[header] = values[i];
                    });
                    return payment;
                });
                console.log('payments:', payments);
                // 匯入方案
                const res = await importPayment(payments);
                console.log('res:', res);
                alert('匯入成功！');
                window.location.reload(); // 重新載入頁面
            };
            reader.readAsText(file);
        };
        input.click();
    }

    return (
        <div className={style.TopBtnBarContainer}>
            <div className={style.TopBtnBarRow}>
                <h2>方案管理</h2>
            </div>
            <div className={style.TopBtnBarRow}>
                <button onClick={clickAddPayment} className={style.primaryBtn}>新增方案</button>
                <button onClick={clickExportPayment} className={style.secondaryBtn}>匯出方案</button>
                <button onClick={clickImportPayment} className={style.secondaryBtn}>匯入方案</button>
            </div>
        </div>
    )
}

export default TopBtnBarPayment;
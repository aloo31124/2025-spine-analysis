import React from "react";
import style from "./TopBtnBar.module.css";
import { useNavigate } from "react-router-dom";
import { importProduct } from "../../../api/manager/product";

/* 後台管理, 上方功能bar */
function TopBtnBarProduct({productList, categoryList}) {
    const navigate = useNavigate();

    const clickAddProduct = () => {
        navigate("/manager/product/add", { state: { categoryList }});
    }

    const clickToCategoryList = () => {
        navigate("/manager/product/category/list");
    }

    // 將 productList 轉為 CSV 字串
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


    /* 匯出商品為 csv 檔 
        - 抽離, 目錄名稱 規劃
        - 欄位預設排序 與 設定排序
        - userId 轉 名稱? 商品id ?
        - 匯出 整份資料? or 匯出該分頁?
    */
    const clickExportProduct = () => {
        if (!productList || productList.length === 0) {
            alert('無商品可匯出');
            return;
        }

        // 1. 轉換 CSV
        const csvContent = convertToCSV(productList);
        // 2. 加上 BOM (防止 Excel 中文亂碼)
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        // 3. 建立下載 a 標籤
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `product_list_${new Date().toISOString().slice(0, 10)}.csv`;  
        // 4. 自動觸發下載
        document.body.appendChild(a);
        a.click();
        // 5. 清除資源
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /* 匯入商品 
        將 csv 檔轉為 json 格式
    */
    const clickImportProduct = () => {
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
                const products = rows.slice(1).map(row => {
                    console.log('row:', row);
                    const values = row.split(',');
                    const product = {};
                    headers.forEach((header, i) => {
                        values[i] = values[i].replace("\r", '');
                        if(values[i].trim().length === 0) return;
                        if(header.trim().length === 0) return;
                        product[header] = values[i];
                    });
                    return product;
                });
                console.log('products:', products);
                // 匯入商品
                const res = await importProduct(products);
                console.log('res:', res);
            };
            reader.readAsText(file);
        };
        input.click();
    }

    return (
        <div className={style.TopBtnBar}>
            <button onClick={clickAddProduct}>新增商品</button>
            <button onClick={clickToCategoryList}>分類列表</button>
            <button onClick={clickExportProduct}>匯出商品</button>
            <button onClick={clickImportProduct}>匯入商品</button>
        </div>
    )
}

export default TopBtnBarProduct;

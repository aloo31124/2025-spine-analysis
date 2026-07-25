import React, {useRef} from "react";
import {getProductList, getProductCategoryList, getUserList, importAllDBTable} from '../../api/manager/backup'
import {exportJsonToCsv} from '../../utils/exportCSV';
import { parseCSVtoJson } from "../../utils/parseCSV";

function SystemPage() {
  const fileInputRef = useRef();
    
  /** 匯出db所有表 */
  const clickExportAllDBTable = async () => {
    try {
      const [usersRes, productRes, productCategoryRes] = await Promise.all([
        getUserList(),
        getProductList(),
        getProductCategoryList()
      ]);

      // 依序匯出
      exportJsonToCsv("user_list", usersRes.data.result);
      exportJsonToCsv("product_list", productRes.data.result);
      exportJsonToCsv("productCategory_list", productCategoryRes.data.result);
    } catch (error) {
      console.error("匯出 DB 資料表時發生錯誤：", error);
      alert("匯出過程中發生錯誤，請稍後再試");
    }
  }

  /** 匯入所有db表 - 點擊觸發 file input */
  const clickImportAllDBTable = () => {
    fileInputRef.current.click(); // 模擬點擊 input type="file"
  };

  /** 使用者選擇檔案後觸發 */
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return alert("請選擇要匯入的 CSV 檔案");

    try {
      const fileMap = {
        user_list: null,
        product_list: null,
        productCategory_list: null,
      };

      for (const file of files) {
        if (file.name.includes("user_list")) fileMap.user_list = file;
        if (file.name.includes("product_list")) fileMap.product_list = file;
        if (file.name.includes("productCategory_list")) fileMap.productCategory_list = file;
      }

      const [userList, productList, categoryList] = await Promise.all([
        fileMap.user_list ? parseCSVtoJson(fileMap.user_list) : [],
        fileMap.product_list ? parseCSVtoJson(fileMap.product_list) : [],
        fileMap.productCategory_list ? parseCSVtoJson(fileMap.productCategory_list) : [],
      ]);

      await importAllDBTable(userList, productList, categoryList);

      alert("匯入成功！");
    } catch (err) {
      console.error("匯入失敗：", err);
      alert("匯入過程中發生錯誤！");
    } finally {
      e.target.value = ""; // 重置 input，避免選同檔案不觸發 onChange
    }
  };


    /** 匯出商品列表 */
    const exportProductList = async () => {
        const res = await getProductList();
        exportJsonToCsv("商品列表", res.data.result);
    }

    /** 匯出商品分類列表 */
    const exportProductCategoryList = async () => {
        const res = await getProductCategoryList();
        exportJsonToCsv("商品分類列表", res.data.result);
    }

    /** 匯出使用者列表 */
    const exportUserList = async () => {
        const res = await getUserList();
        exportJsonToCsv("使用者列表", res.data.result);
    }

    return (
        <div className='pageContianer'>
            <h1>系統管理</h1>
            <div className="pageRow">
                <button onClick={clickExportAllDBTable}>匯出db所有表</button>
                <button onClick={clickImportAllDBTable}>匯入所有db表</button>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept=".csv"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
            </div>
            <div className="pageRow">
                <button onClick={exportProductList}>匯出商品列表</button>
                <button onClick={exportProductCategoryList}>匯出商品分類列表</button>
                <button onClick={exportUserList}>匯出使用者列表</button>
            </div>
        </div>
    );
}
export default SystemPage;
import React from "react";
import style from "./TopBtnBar.module.css";
import { useNavigate } from "react-router-dom";

function TopBtnBarCategory() {
  const navigate = useNavigate();

  /* 導向新增商品分類頁面 */
  const clickAddProductCategory = () => {
    navigate("/manager/product/category/add");
  }
  /* 導向 商品列表 */
  const clickToProductList = () => {
    navigate("/manager/product/list");
  }
  
  return (
    <div className={style.TopBtnBar}>
        <button onClick={clickAddProductCategory}>新增分類</button>
        <button onClick={clickToProductList}>商品列表</button>
        <button>匯出分類</button>
        <button>匯入分類</button>
    </div>
  );
}
export default TopBtnBarCategory;

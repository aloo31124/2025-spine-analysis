import React from "react";
import style from "../../../pages/manager/manager.module.css";
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
    <div className={style.TopBtnBarContainer}>
        <div className={style.TopBtnBarRow}>
            <h2>分類管理</h2>
        </div>
        <div className={style.TopBtnBarRow}>
            <button onClick={clickAddProductCategory} className={style.primaryBtn}>新增分類</button>
            <button onClick={clickToProductList} className={style.secondaryBtn}>商品列表</button>
            <button className={style.secondaryBtn}>匯出分類</button>
            <button className={style.secondaryBtn}>匯入分類</button>
        </div>
    </div>
  );
}
export default TopBtnBarCategory;

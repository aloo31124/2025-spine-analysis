import React, {useEffect, useState} from "react";
import TopBtnBarCategory from "../../components/manager/TopBtnBar/TopBtnBarCategory";
import SearchBarCategory from "../../components/manager/SearchBar/SearchBarCategory";
import TableRow from "../../components/manager/TableRow/TableRow";
import { getProductCategoryList, deleteProductCategory } from "../../api/manager/product-category";
import { useNavigate } from "react-router-dom";
import styles from './CategoryListPage.module.css';

function CategoryListPage() {
  const navigate = useNavigate();
  const [productCategoryList, setProductCategoryList] = useState([]);

  // 初始時, 取得商品類別列表
  useEffect(() => {
    getProductCategoryList().then((res) => {
      setProductCategoryList(res.data.result);
    }).catch((error) => {
      console.log('取得商品類別列表發生錯誤', error);
    });
  }, []);

  // 編輯商品類別
  const handleEditProductCategory = (category) => {
    navigate(`/manager/product/category/edit/${category.id}`);
  }

  // 搜尋商品類別結果, 重新渲染商品類別
  const handleSearchResult = (searchResult) => {
    setProductCategoryList(searchResult);
  }

  // 刪除商品類別
  const handleDeleteProductCategory = (productCategoryId) => {
    if(!window.confirm('確定要刪除此商品類別?')) return;
    deleteProductCategory(productCategoryId).then((res) => {
      alert('刪除商品類別成功');
      const newProductCategoryList = productCategoryList.filter((productCategory) => productCategory.id !== productCategoryId);
      setProductCategoryList(newProductCategoryList);
    }).catch((error) => {
      console.log('刪除商品類別發生錯誤', error);
    });
  }

  // 渲染桌面版表格
  const renderDesktopTable = () => (
    <table className={styles.categoryTable}>
      <thead>
        <tr>
          <th>分類名稱</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {productCategoryList.length === 0 ? (
          <tr>
            <td colSpan="2" className={styles.emptyState}>
              查無資料
            </td>
          </tr>
        ) : (
          productCategoryList.map(category => (
            <tr key={category.id}>
              <td>
                <div className={styles.categoryName}>
                  {category.name}
                </div>
              </td>
              <td>
                <div className={styles.actionButtons}>
                  <button 
                    className={`${styles.actionButton} ${styles.edit}`}
                    onClick={() => handleEditProductCategory(category)}
                  >
                    編輯
                  </button>
                  <button 
                    className={`${styles.actionButton} ${styles.delete}`}
                    onClick={() => handleDeleteProductCategory(category.id)}
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  // 渲染手機版卡片
  const renderMobileCards = () => (
    <div className={styles.mobileCardContainer}>
      {productCategoryList.length === 0 ? (
        <div className={styles.emptyState}>
          查無資料
        </div>
      ) : (
        productCategoryList.map(category => (
          <div key={category.id} className={styles.categoryCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardTitle}>
                {category.name}
              </div>
            </div>
            
            <div className={styles.cardActions}>
              <button 
                className={`${styles.cardButton} ${styles.edit}`}
                onClick={() => handleEditProductCategory(category)}
              >
                編輯
              </button>
              <button 
                className={`${styles.cardButton} ${styles.delete}`}
                onClick={() => handleDeleteProductCategory(category.id)}
              >
                刪除
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className={styles.categoryListContainer}>
        <TopBtnBarCategory />
        <SearchBarCategory 
            getSearchResult={handleSearchResult}
        />
        
        {/* 桌面版表格 */}
        {renderDesktopTable()}
        
        {/* 手機版卡片 */}
        {renderMobileCards()}
    </div>
  );
}
export default CategoryListPage;


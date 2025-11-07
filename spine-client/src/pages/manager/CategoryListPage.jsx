import React, {useEffect, useState} from "react";
import TopBtnBarCategory from "../../components/manager/TopBtnBar/TopBtnBarCategory";
import SearchBarCategory from "../../components/manager/SearchBar/SearchBarCategory";
import TableRow from "../../components/manager/TableRow/TableRow";
import { getProductCategoryList, deleteProductCategory } from "../../api/manager/product-category";
import { useNavigate } from "react-router-dom";
import style from './manager.module.css';

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

  return (
    <div className={style.ManagerPage}>
        <TopBtnBarCategory />
        <SearchBarCategory 
            getSearchResult={handleSearchResult}
        />
        <div className={style.TableContainer}>
            <table className={style.ManagerTable}>
                <thead>
                    <tr>
                        <th>分類名稱</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {productCategoryList.length === 0 ? (
                        <tr>
                            <td colSpan="2" className={style.NoData}>查無資料</td>
                        </tr>
                    ) : (
                        productCategoryList.map(category => {
                            return (
                                <tr key={category.id}>
                                    <td data-label="分類名稱" className={style.ItemName}>{category.name}</td>
                                    <td data-label="操作" className={style.ActionButtons}>
                                        <button onClick={() => handleEditProductCategory(category)}>編輯</button>
                                        <button onClick={() => handleDeleteProductCategory(category.id)}>刪除</button>
                                    </td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}
export default CategoryListPage;


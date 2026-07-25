import React, {use, useEffect, useState} from "react";
import style from './CreateEdit.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { addProductCategory, getProductCategory, updateProductCategory } from '../../../api/manager/product-category';

function CreateEditCategory({typePage}) {
    // 編輯新增頁狀態
    const typePageList = {CREATE:"CREATE", EDITE:'EDITE'};
    const navigate = useNavigate();
    //編輯該分類id
    const { id } = useParams();
    //商品分類相關屬性
    const [name, setName] = useState(null);

    /* post 新增商品分類 */
    const clickAddProductCategory = async () => {
        if(typePage !== typePageList.CREATE) return;
        const res = await addProductCategory({name});
        if(res.status === 200) {
            alert("商品分類新增成功");
            navigate('/manager/product/category/list');
        } else {
            alert("商品分類新增失敗");
        }
    }

    /* 編輯商品分類, 取得商品分類資訊 */
    useEffect(() => {
        const fetchEditProductCategory = async  () => {
            if(typePage !== typePageList.EDITE) return;
            const res = await getProductCategory(id);
            const editProductCategory = res.data.productCategory;
            setName(editProductCategory.name);
        }
        fetchEditProductCategory();
    }, []);

    /* 編輯商品分類, 更新編輯商品分類 */
    const clickUpdateProductCategory = async () => {
        try {
            const res = await updateProductCategory({id, name});
            if(res.status === 200) {
                alert("商品分類更新成功");
                navigate('/manager/product/category/list');
            } else {
                alert("商品分類更新失敗");
            }
        } catch (error) {
            alert("商品分類更新錯誤");
        }
    }


    return (
        <div className={style.CreateEditProduct}>
            <div className={style.CreateEditProductTopBar}>
                <div className={style.CreateEditProductRow}>
                    {
                        typePage === typePageList.CREATE ? 
                            <button onClick={clickAddProductCategory}>新增</button> :
                            <button onClick={clickUpdateProductCategory}>儲存</button>
                    }
                </div>
                <div className={style.CreateEditProductRow}>
                    <input className={style.CreateEditProductTopInput}
                        type="text" 
                        placeholder='分類名稱'
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
export default CreateEditCategory;

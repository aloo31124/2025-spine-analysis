import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getProductMattress, updateProductMattress } from '../../api/manager/productMattress';
import CreateEditProductMattress from '../../components/manager/CreateEdit/CreateEditProductMattress';

/**
 * 床墊商品編輯頁面
 * 參考 ProductPillowEditPage
 */
function ProductMattressEditPage() {
    const { id } = useParams();
    const { state } = useLocation();
    const productMattressFromState = state?.productMattress;
    const [productMattressParam, setProductMattressParam] = useState({});
    const navigate = useNavigate();

    /* 取得床墊商品資訊 */
    useEffect(() => {
        const fetchProductMattress = async () => {
            try {
                if (productMattressFromState) {
                    // 如果從列表頁傳來的資料
                    setProductMattressParam(productMattressFromState);
                } else {
                    // 否則從 API 取得
                    const res = await getProductMattress(id);
                    if (res.data.productMattress) {
                        setProductMattressParam(res.data.productMattress);
                    }
                }
            } catch (error) {
                console.error("取得床墊商品資訊錯誤:", error);
                alert("取得床墊商品資訊錯誤");
            }
        }
        fetchProductMattress();
    }, [id, productMattressFromState]);

    /* 更新床墊商品 */
    const handleUpdateProductMattress = async (productMattress) => {
        try {
            await updateProductMattress({ id, ...productMattress });
            alert('更新成功');
            navigate('/manager/product-mattress/list');
        } catch (error) {
            console.error('更新床墊商品發生錯誤:', error);
            alert('更新失敗');
        }
    }

    return (
        <div className='pageContianer'>
            <CreateEditProductMattress
                productMattress={productMattressParam}
                handleUpdateProductMattress={handleUpdateProductMattress}
                typePage='EDIT'
            />
        </div>
    );
}

export default ProductMattressEditPage;

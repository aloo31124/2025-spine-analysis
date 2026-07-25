import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getProductPillow, updateProductPillow } from '../../api/manager/productPillow';
import CreateEditProductPillow from '../../components/manager/CreateEdit/CreateEditProductPillow';

/**
 * 枕頭商品編輯頁面
 * 獨立於 ProductEditPage
 */
function ProductPillowEditPage() {
    const { id } = useParams();
    const { state } = useLocation();
    const productPillowFromState = state?.productPillow;
    const [productPillowParam, setProductPillowParam] = useState({});
    const navigate = useNavigate();

    /* 取得枕頭商品資訊 */
    useEffect(() => {
        const fetchProductPillow = async () => {
            try {
                if (productPillowFromState) {
                    // 如果從列表頁傳來的資料
                    setProductPillowParam(productPillowFromState);
                } else {
                    // 否則從 API 取得
                    const res = await getProductPillow(id);
                    if (res.data.productPillow) {
                        setProductPillowParam(res.data.productPillow);
                    }
                }
            } catch (error) {
                console.error("取得枕頭商品資訊錯誤:", error);
                alert("取得枕頭商品資訊錯誤");
            }
        }
        fetchProductPillow();
    }, [id, productPillowFromState]);

    /* 更新枕頭商品 */
    const handleUpdateProductPillow = async (productPillow) => {
        try {
            await updateProductPillow({ id, ...productPillow });
            alert('更新成功');
            navigate('/manager/product-pillow/list');
        } catch (error) {
            console.error('更新枕頭商品發生錯誤:', error);
            alert('更新失敗');
        }
    }

    return (
        <div className='pageContianer'>
            <CreateEditProductPillow
                productPillow={productPillowParam}
                handleUpdateProductPillow={handleUpdateProductPillow}
                typePage='EDIT'
            />
        </div>
    );
}

export default ProductPillowEditPage;

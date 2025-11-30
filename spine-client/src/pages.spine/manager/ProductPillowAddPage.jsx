import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProductPillow } from '../../api/manager/productPillow';
import CreateEditProductPillow from '../../components/manager/CreateEdit/CreateEditProductPillow';

/**
 * 枕頭商品新增頁面
 * 獨立於 ProductAddPage
 */
function ProductPillowAddPage() {
    const navigate = useNavigate();
    const [productPillowParam, setProductPillowParam] = useState({});

    /* post 新增枕頭商品 */
    const handleAddProductPillow = async (productPillow) => {
        console.log(" handleAddProductPillow : ", productPillow);
        try {
            const res = await addProductPillow(productPillow);
            if (res.status === 200) {
                alert("枕頭商品新增成功");
                navigate('/manager/product-pillow/list');
            } else {
                alert("枕頭商品新增失敗");
            }
        } catch (error) {
            console.error("新增枕頭商品發生錯誤:", error);
            alert("枕頭商品新增失敗");
        }
    }

    return (
        <div className='pageContianer'>
            <CreateEditProductPillow
                productPillow={productPillowParam}
                handleAddProductPillow={handleAddProductPillow}
                typePage='CREATE'
            />
        </div>
    );
}

export default ProductPillowAddPage;

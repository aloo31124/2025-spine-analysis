import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProductMattress } from '../../api/manager/productMattress';
import CreateEditProductMattress from '../../components/manager/CreateEdit/CreateEditProductMattress';

/**
 * 床墊商品新增頁面
 * 參考 ProductPillowAddPage
 */
function ProductMattressAddPage() {
    const navigate = useNavigate();
    const [productMattressParam, setProductMattressParam] = useState({});

    /* post 新增床墊商品 */
    const handleAddProductMattress = async (productMattress) => {
        console.log(" handleAddProductMattress : ", productMattress);
        try {
            const res = await addProductMattress(productMattress);
            if (res.status === 200) {
                alert("床墊商品新增成功");
                navigate('/manager/product-mattress/list');
            } else {
                alert("床墊商品新增失敗");
            }
        } catch (error) {
            console.error("新增床墊商品發生錯誤:", error);
            alert("床墊商品新增失敗");
        }
    }

    return (
        <div className='pageContianer'>
            <CreateEditProductMattress
                productMattress={productMattressParam}
                handleAddProductMattress={handleAddProductMattress}
                typePage='CREATE'
            />
        </div>
    );
}

export default ProductMattressAddPage;

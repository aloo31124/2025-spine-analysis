import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getProduct, updateProduct, uploadImg, getProductImgList, deleteProductImg } from '../../api/manager/product';
import CreateEditProduct from '../../components/manager/CreateEdit/CreateEditProduct';

/* 商品編輯 */
function ProductEditPage() {
    // 編輯商品id
    const { id } = useParams();
    const { state } = useLocation();
    const product = state?.product;
    const categoryList = state?.categoryList;
    // 編輯商品資訊
    const [productParam, setProductParam] = useState({});
    // 路由
    const navigate = useNavigate();
    // 上傳,刪除 圖片相關 trigger
    const [uploadImgTrigger, setUploadImgTrigger] = useState(0);
    const [deleteImgTrigger, setDeleteImgTrigger] = useState(0);

    
    // 編輯商品上傳檔案, 已有商品id
    const handleUpload = async (formData) => {
        uploadImg(formData, id);
        setUploadImgTrigger(count => count + 1);
    };

    // 刪除圖片, 已有商品id
    const handleDeleteImage = async (storageName) => {
        try {
            await deleteProductImg(id, storageName);
            alert("圖片刪除成功");
        } catch (error) {
            alert("圖片刪除失敗");
        }
        setDeleteImgTrigger(count => count + 1);
    };

    /* 編輯商品, 取得商品資訊 */
    useEffect(() => {
        console.log(" ProductEditPage useEffect ");
        // 取得 商品編輯資訊
        const fetchEditProduct = async  () => {
            try {
                //const prodcutResult = await getProduct(id);
                //const editProduct = prodcutResult.data.product;
                // 設定 編輯商品資訊
                const name = product.name;
                const state = "草稿";
                const categoryId = product.categoryId;
                const price = product.price;

                //const imgListResult = await getProductImgList(id);
                //const imgList = imgListResult.data.imageList;
                const imgList = product.imgList || [];
                // 設定 編輯商品資訊
                
                setProductParam({
                    name,
                    state,
                    categoryId,
                    price,
                    imgList
                });
            } catch (error) {
                alert("取得商品資訊錯誤");
            }
        }
        fetchEditProduct();
    }, [uploadImgTrigger, deleteImgTrigger]);

    /* 編輯商品, 更新編輯商品 */
    const handleUpdateProduct = async (product) => {
        try {
            await updateProduct({id, ...product});
            alert('更新成功');
            navigate('/manager/product/list');
        } catch (error) {
            alert('更新失敗:', error);
        }
    }



    return (
        <div className='pageContianer'>
            <CreateEditProduct 
                product={productParam}
                categoryList={categoryList}
                handleUpdateProduct={handleUpdateProduct}
                handleUpload={handleUpload}
                handleDeleteImage={handleDeleteImage}
                typePage='EDITE'
            />
        </div>
    );
}
export default ProductEditPage;

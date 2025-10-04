import React, { useEffect, useState, useCallback  } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { addProduct, getProduct, updateProduct, uploadImg, getProductImgList, deleteProductImg } from '../../api/manager/product';
import CreateEditProduct from '../../components/manager/CreateEdit/CreateEditProduct';

/* 商品新增 */
function ProductAddPage() {
    // 路由
    const navigate = useNavigate();
    const { state } = useLocation();
    const categoryList = state?.categoryList;
    // 暫存 product id , 暫時儲存圖片
    const [tempId, setTempId] = useState("");
    // 新增商品資訊
    const [productParam, setProductParam] = useState({});
    // 上傳,刪除 圖片相關 trigger
    const [uploadImgTrigger, setUploadImgTrigger] = useState(0);
    const [deleteImgTrigger, setDeleteImgTrigger] = useState(0);


    // 初始暫存 商品id
    useEffect(() => {
        const _tempId = "TEMP_ID_" + (new Date().getTime());
        setTempId(_tempId);
    }, [])

    
    // 新增商品上傳檔案, 已有商品id
    const handleUpload = async (formData) => {
        uploadImg(formData, tempId);
        setUploadImgTrigger(count => count + 1);
    };

    // 新增圖片, 已有商品id
    const handleDeleteImage = async (storageName) => {
        try {
            await deleteProductImg(tempId, storageName);
            alert("圖片刪除成功");
        } catch (error) {
            alert("圖片刪除失敗");
        }
        setDeleteImgTrigger(count => count + 1);
    };

    // 刷新圖片
    useEffect(() => {
            console.log(" ProductAddPage useEffect ");
            // 取得 商品編輯資訊
            const fetchEditProduct = async () => {
                console.log(" fetchEditProduct ")
                try {
                    if(!tempId) return;
                    const imgListResult = await getProductImgList(tempId);
                    const imgList = imgListResult.data.imageList;
                    setProductParam({
                        imgList
                    });
                } catch (error) {
                    //alert("取得商品圖片失敗");
                }
            }
            fetchEditProduct();
    },[uploadImgTrigger, deleteImgTrigger]);

    /* post 新增商品 */
    const handleAddProduct = async (product) => {
        console.log(" handleAddProduct : ", product)
        const res = await addProduct({tempId, ...product});
        if(res.status === 200) {
            alert("商品新增成功");
            navigate('/manager/product/list');
        } else {
            alert("商品新增失敗");
        }
    }


    return (
        <div className='pageContianer'>
            <CreateEditProduct 
                categoryList={categoryList}
                product={productParam}
                handleAddProduct={handleAddProduct}
                handleUpload={handleUpload}
                handleDeleteImage={handleDeleteImage}
                typePage='CREATE'
            />
        </div>
    );

}
export default ProductAddPage;

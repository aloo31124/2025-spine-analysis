import React, { useEffect, useState, useCallback  } from 'react';
import style from './CreateEdit.module.css';
import CategoryDialog from '../../dialog/CategoryDialog/CategoryDialog';
import DropzoneDialog from "../../dialog/DropzoneDialog/DropzoneDialog";
import ProductGalleryDialog from "../../dialog/ProductGalleryDialog/ProductGalleryDialog";

function CreateEditProduct({typePage, product, categoryList,
    handleUpdateProduct, handleAddProduct, handleUpload, handleDeleteImage}) {
    // 商品分類
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    // 編輯新增頁狀態
    const typePageList = {CREATE:"CREATE", EDITE:'EDITE'};
    // 編輯商品資訊
    const [name, setName] = useState(null);
    const [state, setState] = useState("草稿");
    const [categoryId, setCategoryId] = useState("");
    const [price, setPrice] = useState(0);
    // 其他呈現資訊, 商品分類
    const [categoryName, setCategoryName] = useState("");
    // 商品圖片上傳
    const [showDropzone, setShowDropzone] = useState(false);
    const [files, setFiles] = useState([]);
    // 商品圖片呈現
    const [imgList, setImgList] = useState([]);
    // 預覽商品櫥窗視窗
    const [showProductGallery, setShowProductGallery] = useState(false);



    /* 初始商品, 編輯商品資訊 */
    useEffect(() => {
        console.log("useEffect product");
        const fetchEditProduct = async () => {
            setName(name || product.name);
            setState(state || product.state);
            setCategoryId(categoryId || product.categoryId);
            setPrice(price || product.price);
            setImgList(product.imgList);
        }
        fetchEditProduct();
    }, [product]);


    /* post 新增商品 */
    const clickAddProduct = async () => {
        if(typePage !== typePageList.CREATE) return;
        handleAddProduct({name, state, categoryId, price: Number(price)});
    }

    /* 編輯商品, 更新編輯商品 */
    const clickUpdateProduct = async () => {
        if(typePage !== typePageList.EDITE) return;
        handleUpdateProduct({ name, categoryId, price});
    }

    // 選擇 商品分類
    const selectedCategory = async () => {
        
    }


    // 批次圖片暫存
    const onDrop = useCallback((acceptedFiles) => {
        setFiles([...files, ...acceptedFiles]); 
    }, [files]);

    // 編輯商品上傳檔案, 已有商品id
    const clickUploadImgList = async () => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file);
        });
        handleUpload(formData);
        setShowDropzone(false);
        setFiles([]); // 清空已選擇的檔案
    };

    // 刪除圖片
    const clickDeleteImage = async (storageName) => {
        handleDeleteImage(storageName);
    };


    return (
        <div className={style.CreateEditProduct}>
            <div className={style.CreateEditProductTopBar}>
                <div className={style.CreateEditProductRow}>
                    <span>狀態:{typePage === typePageList.CREATE ? '(新增)' : '(編輯)'}  草稿
                    </span>
                    <button>上架</button>
                </div>
                <div className={style.CreateEditProductRow}>
                    {typePage === typePageList.CREATE ? 
                        <button onClick={clickAddProduct}>新增</button>
                        : <button onClick={clickUpdateProduct}>儲存</button>
                    } 
                    
                    <button>複製商品</button>
                    <button>刪除</button>
                </div>
                <div className={style.CreateEditProductRow}>
                    <input className={style.CreateEditProductTopInput}
                        type="text" 
                        placeholder='商品名稱'
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
            </div>
            <div className={style.CreateEditProductContainer}>
                <h2>商品分類</h2>
                <div className={style.CreateEditProductRow}>
                    <input
                        type="text"
                        placeholder="選擇分類"
                        value={(categoryList.find(c => c.id === categoryId))?.name || ''}
                        readOnly
                        onClick={() => setIsCategoryDialogOpen(true)} // 點擊時打開 Dialog
                    />
                    <button>新增分類</button>
                </div>
            </div>
            {/* CategoryDialog 分類視窗 */}
            <CategoryDialog
                isOpen={isCategoryDialogOpen}
                onClose={() => setIsCategoryDialogOpen(false)}
                onSelect={setCategoryId}
                categoryList={categoryList}
            />

            <div className={style.CreateEditProductContainer}>
                <h2>商品屬性</h2>
                <div className={style.CreateEditProductRow}>
                    <h3>付款方式</h3>
                    <button>郵局</button>
                    <button>信用卡</button>
                    <button>ATM</button>
                </div>
                <div className={style.CreateEditProductRow}>
                    <h3>運送</h3>
                    <button>郵局</button>
                    <button>7-11</button>
                    <button>超商</button>
                </div>
                <div className={style.CreateEditProductRow}>
                    <h3>樣式</h3>
                    <button>黑色</button>
                    <button>白色</button>
                    <button>紅色</button>
                </div>
            </div>
            <div className={style.CreateEditProductContainer}>
                <h2>商品價格</h2>
                <div className={style.CreateEditProductRow}>
                    <input type="number" 
                        placeholder='商品價格'
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                    />
                </div>
                <div className={style.CreateEditProductRow}>
                    <input type="number" 
                        placeholder='優惠價'
                    />
                    優惠期間:
                    <input type="text" 
                        placeholder='開始日期'
                    />
                    ~
                    <input type="text" 
                        placeholder='結束日期'
                    />
                </div>
            </div>
            <div className={style.CreateEditProductContainer}>
                <h2>商品庫存</h2>
                <div className={style.CreateEditProductRow}>
                    <input type="text" 
                        placeholder='庫存數'
                    />
                </div>
                <div className={style.CreateEditProductRow}>
                    <input type="text" 
                        placeholder='0'
                    />
                    以下，停止販售，顯示庫存不足。
                </div>
            </div>
            <div className={style.CreateEditProductContainer}>
                <h2>商品圖庫</h2>
                <div className={style.CreateEditProductRow}>
                    <button onClick={() => setShowDropzone(true)}>上傳檔案</button>
                    <button onClick={() => setShowProductGallery(true)}>預覽櫥窗</button>
                </div>
                <div className={style.imgGrid}>
                    {imgList && imgList.map(({ storageName, imgUrl }) => (
                        <div key={storageName} className={style.imgWrapper}>
                            <img className={style.CreateEditProductImg} src={imgUrl} alt="圖片" />
                            <button className={style.deleteBtn} 
                                onClick={() => clickDeleteImage(storageName)}>
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                {/* 拖曳上傳圖片視窗 */}
                {showDropzone && (
                    <DropzoneDialog 
                        onClose={() => setShowDropzone(false)}
                        files={files}
                        onDrop={onDrop}
                        onUpload={clickUploadImgList}
                    />
                )}

                {/* 預覽商品櫥窗 */}
                {showProductGallery && (
                    <ProductGalleryDialog
                        isOpen={showProductGallery}
                        onClose={() => setShowProductGallery(false)}
                    />
                )}



            </div>
            <div className={style.CreateEditProductContainer}>
                <h2>商品說明</h2>
            </div>
        </div>
    );
}
export default CreateEditProduct;


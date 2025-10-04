const Product = require('../models/product.model');
const productImgFireStorage = require('./productImgFireStorage.service');
const productCategoryService = require('./productCategory.service');

/* 匯出所有 商品 列表 */
exports.exportAllProductList = async () => {
    return this.searchProductJoinCategoryPromotion({},{});
}

/* 匯入 所有 商品 進入空表, 不卡控, 使用於備份還原。 */
exports.importAllProduct = async (productList) => {
    try {
        return await Product.importAllProduct(productList);
    } catch (error) {
        console.error("[importAllProduct] error :", error);
    }
}


/* 取得商品列表, 串組商品圖片列 */
exports.getProductList = async () => {
    try {
        console.log("[getProductList] start :");
        const productList = await this.searchProductJoinCategoryPromotion({},{});
        const result = await Promise.all(productList.map(async product => {
            const imgList = (await productImgFireStorage.getProductImgList(product.id)).map(obj => obj.imgUrl);
            return {...product, imgList};
        }));
        console.log("[getProductList] end , result :", result);
        return result;
    } catch (error){
        console.error("[getProductList] error :", error);
    }
}

/* 搜尋商品, 合併 商品分類, 促銷, 價錢範圍 */
exports.searchProductJoinCategoryPromotion = async (searchParam, pagingParam) => {
    try {
        console.log("[searchProductJoinCategoryPromotion] start :");
        // 取得所有商品, 篩選價格, 關鍵字
        const {keyword, state, priceRange} = searchParam;
        // 需整合進  Product.searchProduct()
        const _productList = (await Product.getAllProductList()).filter(product => 
            (keyword ? product.name.includes(keyword) : true) 
            && (state ? product.state === state : true) 
            && (Number(priceRange?.min) ? Number(product.price) >= Number(priceRange.min) : true) 
            && (Number(priceRange?.max) ? Number(product.price) <= Number(priceRange.max) : true) 
        ); 

        // 篩選, join 商品分類
        let categoryList = (searchParam?.categoryList?.every(c => !c.isSelected)) ? null : searchParam?.categoryList;
        if(!categoryList) {
            categoryList = (await productCategoryService.searchProductCategory({}, {})).map(c => ({...c, isSelected: true}));
        }
        const productListJoinCategory = _productList
                    .map(p => ({ ...p, categoryName: (categoryList.find(c => c.id === p.categoryId && c.isSelected))?.name || '' }))
                    .filter(p => p?.categoryName?.length > 0);

        // 篩選相關 促銷 (略)
        // 需再 下階段 評估 促銷 與 商品, 訂單的綁定方式。

        // 商品 串組圖片
        let productList = await Promise.all(productListJoinCategory.map(async product => {
            // 需串組圖片完整資料, storeName
            const imgList = (await productImgFireStorage.getProductImgList(product.id))//.map(obj => obj.imgUrl);
            return {...product, imgList};
        }));

        // 分頁 臨時寫法
        let { pageIndex, pageSize, sort } = pagingParam; // 分頁參數
        if(pageIndex && pageSize) {
            pagingParam.dataTotal = (productList.length);
            pagingParam.pageTotal = Math.ceil(productList.length / pageSize);
            productList = productList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        }
        console.log("[searchProductJoinCategoryPromotion] end , result :", productList);
        return {productList, pagingParam};
    } catch (error){
        console.error("[searchProductJoinCategoryPromotion] error :", error);
    }
}


/* 新增商品 */
exports.addProduct = async (product) => {
    return Product.addProduct(product);
}

/* 取得商品 */
exports.getProduct = async (id) => {
    return Product.getProduct(id);
}

/* 更新商品 */
exports.updateProduct = async (product) => {
    return Product.updateProduct(product);
}

/* 刪除商品 */
exports.deleteProduct = async (id) => {
    return Product.deleteProduct(id);
}

/* 搜尋商品 */
exports.searchProduct = async (searchParam, pagingParam) => {
    return Product.searchProduct(searchParam, pagingParam);
}

/* 匯入商品 */
exports.importProduct = async (productList) => {
    return Product.importProduct(productList);
}

/*
 * [service層] 負責枕頭商品業務邏輯
 * 獨立於 product.service.js
 */

const ProductPillow = require('../models/productPillow.model');

/* 匯出所有 枕頭商品 列表 */
exports.exportAllProductPillowList = async () => {
    return this.searchProductPillow({}, {});
}

/* 匯入 所有 枕頭商品 進入空表, 不卡控, 使用於備份還原。 */
exports.importAllProductPillow = async (productPillowList) => {
    try {
        return await ProductPillow.importAllProductPillow(productPillowList);
    } catch (error) {
        console.error("[importAllProductPillow] error :", error);
    }
}

/* 取得枕頭商品列表 */
exports.getProductPillowList = async (userId = null) => {
    try {
        console.log("[getProductPillowList] start :");
        let productPillowList = await ProductPillow.getAllProductPillowList();
        
        // 如果提供 userId，則只返回該用戶的商品
        if (userId) {
            productPillowList = productPillowList.filter(p => p.userId === userId);
        }
        
        console.log("[getProductPillowList] end , result :", productPillowList);
        return productPillowList;
    } catch (error) {
        console.error("[getProductPillowList] error :", error);
        throw error;
    }
}

/* 搜尋枕頭商品 */
exports.searchProductPillow = async (searchParam, pagingParam, userId = null) => {
    try {
        console.log("[searchProductPillow] start :");
        const { keyword, state, priceRange, shortHeightRange, longHeightRange } = searchParam;
        
        // 取得所有枕頭商品
        let productPillowList = await ProductPillow.getAllProductPillowList();
        
        // 篩選
        productPillowList = productPillowList.filter(product =>
            (keyword ? product.name.includes(keyword) : true)
            && (userId ? product.userId === userId : true)
            && (state ? product.state === state : true)
            && (Number(priceRange?.min) ? Number(product.price) >= Number(priceRange.min) : true)
            && (Number(priceRange?.max) ? Number(product.price) <= Number(priceRange.max) : true)
            && (Number(shortHeightRange?.min) ? Number(product.shortHeight) >= Number(shortHeightRange.min) : true)
            && (Number(shortHeightRange?.max) ? Number(product.shortHeight) <= Number(shortHeightRange.max) : true)
            && (Number(longHeightRange?.min) ? Number(product.longHeight) >= Number(longHeightRange.min) : true)
            && (Number(longHeightRange?.max) ? Number(product.longHeight) <= Number(longHeightRange.max) : true)
        );

        // 分頁
        let { pageIndex, pageSize, sort } = pagingParam;
        if (pageIndex && pageSize) {
            pagingParam.dataTotal = productPillowList.length;
            pagingParam.pageTotal = Math.ceil(productPillowList.length / pageSize);
            productPillowList = productPillowList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        }

        console.log("[searchProductPillow] end , result :", productPillowList);
        return { productPillowList, pagingParam };
    } catch (error) {
        console.error("[searchProductPillow] error :", error);
        throw error;
    }
}


/* 新增枕頭商品 */
exports.addProductPillow = async (productPillow) => {
    return ProductPillow.addProductPillow(productPillow);
}

/* 取得枕頭商品 */
exports.getProductPillow = async (id) => {
    return ProductPillow.getProductPillow(id);
}

/* 更新枕頭商品 */
exports.updateProductPillow = async (productPillow) => {
    return ProductPillow.updateProductPillow(productPillow);
}

/* 刪除枕頭商品 */
exports.deleteProductPillow = async (id) => {
    return ProductPillow.deleteProductPillow(id);
}

/* 匯入枕頭商品 */
exports.importProductPillow = async (productPillowList) => {
    return ProductPillow.importProductPillow(productPillowList);
}

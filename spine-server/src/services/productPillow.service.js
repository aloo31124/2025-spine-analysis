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
        const { 
            keyword,           // 名稱模糊搜尋
            type,              // 類型模糊搜尋
            stateList,         // 狀態多選搜尋 (陣列)
            state,             // 狀態單選搜尋 (向下相容)
            priceMin, priceMax,                     // 價格範圍
            shortHeightMin, shortHeightMax,         // 短高度範圍
            longHeightMin, longHeightMax,           // 長高度範圍
            shortCurvatureMin, shortCurvatureMax,   // 短弧度範圍
            mediumCurvatureMin, mediumCurvatureMax, // 中弧度範圍
            longCurvatureMin, longCurvatureMax      // 長弧度範圍
        } = searchParam;
        
        // 取得所有枕頭商品
        let productPillowList = await ProductPillow.getAllProductPillowList();
        
        // 篩選
        productPillowList = productPillowList.filter(product => {
            // 名稱模糊搜尋
            const matchKeyword = keyword ? product.name?.toLowerCase().includes(keyword.toLowerCase()) : true;
            
            // 類型模糊搜尋
            const matchType = type ? product.type?.toLowerCase().includes(type.toLowerCase()) : true;
            
            // 狀態多選搜尋 (優先使用 stateList，若無則使用 state)
            let matchState = true;
            if (stateList && stateList.length > 0) {
                matchState = stateList.includes(product.state);
            } else if (state) {
                matchState = product.state === state;
            }
            
            // userId 篩選
            const matchUserId = userId ? product.userId === userId : true;
            
            // 價格範圍搜尋
            const matchPriceMin = priceMin !== undefined && priceMin !== '' ? Number(product.price) >= Number(priceMin) : true;
            const matchPriceMax = priceMax !== undefined && priceMax !== '' ? Number(product.price) <= Number(priceMax) : true;
            
            // 短高度範圍搜尋
            const matchShortHeightMin = shortHeightMin !== undefined && shortHeightMin !== '' ? Number(product.shortHeight) >= Number(shortHeightMin) : true;
            const matchShortHeightMax = shortHeightMax !== undefined && shortHeightMax !== '' ? Number(product.shortHeight) <= Number(shortHeightMax) : true;
            
            // 長高度範圍搜尋
            const matchLongHeightMin = longHeightMin !== undefined && longHeightMin !== '' ? Number(product.longHeight) >= Number(longHeightMin) : true;
            const matchLongHeightMax = longHeightMax !== undefined && longHeightMax !== '' ? Number(product.longHeight) <= Number(longHeightMax) : true;
            
            // 短弧度範圍搜尋
            const matchShortCurvatureMin = shortCurvatureMin !== undefined && shortCurvatureMin !== '' ? Number(product.shortCurvature) >= Number(shortCurvatureMin) : true;
            const matchShortCurvatureMax = shortCurvatureMax !== undefined && shortCurvatureMax !== '' ? Number(product.shortCurvature) <= Number(shortCurvatureMax) : true;
            
            // 中弧度範圍搜尋
            const matchMediumCurvatureMin = mediumCurvatureMin !== undefined && mediumCurvatureMin !== '' ? Number(product.mediumCurvature) >= Number(mediumCurvatureMin) : true;
            const matchMediumCurvatureMax = mediumCurvatureMax !== undefined && mediumCurvatureMax !== '' ? Number(product.mediumCurvature) <= Number(mediumCurvatureMax) : true;
            
            // 長弧度範圍搜尋
            const matchLongCurvatureMin = longCurvatureMin !== undefined && longCurvatureMin !== '' ? Number(product.longCurvature) >= Number(longCurvatureMin) : true;
            const matchLongCurvatureMax = longCurvatureMax !== undefined && longCurvatureMax !== '' ? Number(product.longCurvature) <= Number(longCurvatureMax) : true;
            
            return matchKeyword 
                && matchType 
                && matchState 
                && matchUserId
                && matchPriceMin && matchPriceMax
                && matchShortHeightMin && matchShortHeightMax
                && matchLongHeightMin && matchLongHeightMax
                && matchShortCurvatureMin && matchShortCurvatureMax
                && matchMediumCurvatureMin && matchMediumCurvatureMax
                && matchLongCurvatureMin && matchLongCurvatureMax;
        });

        // 分頁
        let { pageIndex, pageSize, sort } = pagingParam;
        
        // 排序
        if (sort) {
            productPillowList = productPillowList.sort((a, b) => {
                if (a[sort] > b[sort]) return 1;
                if (a[sort] < b[sort]) return -1;
                return 0;
            });
        }
        
        if (pageIndex && pageSize) {
            pagingParam.dataTotal = productPillowList.length;
            pagingParam.pageTotal = Math.ceil(productPillowList.length / pageSize);
            productPillowList = productPillowList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        }

        console.log("[searchProductPillow] end , result count:", productPillowList.length);
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

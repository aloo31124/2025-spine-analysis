/*
 * [service層] 負責床墊商品業務邏輯
 * 參考 productPillow.service.js 創建
 */

const ProductMattress = require('../models/productMattress.model');

/* 匯出所有 床墊商品 列表 */
exports.exportAllProductMattressList = async () => {
    return this.searchProductMattress({}, {});
}

/* 匯入 所有 床墊商品 進入空表, 不卡控, 使用於備份還原。 */
exports.importAllProductMattress = async (productMattressList) => {
    try {
        return await ProductMattress.importAllProductMattress(productMattressList);
    } catch (error) {
        console.error("[importAllProductMattress] error :", error);
    }
}

/* 取得床墊商品列表 */
exports.getProductMattressList = async (userId = null) => {
    try {
        console.log("[getProductMattressList] start :");
        let productMattressList = await ProductMattress.getAllProductMattressList();
        
        // 如果提供 userId，則只返回該用戶的商品
        if (userId) {
            productMattressList = productMattressList.filter(p => p.userId === userId);
        }
        
        console.log("[getProductMattressList] end , result :", productMattressList);
        return productMattressList;
    } catch (error) {
        console.error("[getProductMattressList] error :", error);
        throw error;
    }
}

/* 搜尋床墊商品 */
exports.searchProductMattress = async (searchParam, pagingParam, userId = null) => {
    try {
        console.log("[searchProductMattress] start :");
        const { 
            keyword,           // 名稱模糊搜尋
            model,             // 型號搜尋
            stateList,         // 狀態多選搜尋 (陣列)
            state,             // 狀態單選搜尋 (向下相容)
            priceMin, priceMax // 價格範圍
        } = searchParam;
        
        // 取得所有床墊商品
        let productMattressList = await ProductMattress.getAllProductMattressList();
        
        // 篩選
        productMattressList = productMattressList.filter(product => {
            // 名稱模糊搜尋
            const matchKeyword = keyword ? product.name?.toLowerCase().includes(keyword.toLowerCase()) : true;
            
            // 型號搜尋
            const matchModel = model ? product.model === model : true;
            
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
            
            return matchKeyword 
                && matchModel 
                && matchState 
                && matchUserId
                && matchPriceMin && matchPriceMax;
        });

        // 分頁
        let { pageIndex, pageSize, sort } = pagingParam;
        
        // 排序
        if (sort) {
            productMattressList = productMattressList.sort((a, b) => {
                if (a[sort] > b[sort]) return 1;
                if (a[sort] < b[sort]) return -1;
                return 0;
            });
        }
        
        if (pageIndex && pageSize) {
            pagingParam.dataTotal = productMattressList.length;
            pagingParam.pageTotal = Math.ceil(productMattressList.length / pageSize);
            productMattressList = productMattressList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        }

        console.log("[searchProductMattress] end , result count:", productMattressList.length);
        return { productMattressList, pagingParam };
    } catch (error) {
        console.error("[searchProductMattress] error :", error);
        throw error;
    }
}


/* 新增床墊商品 */
exports.addProductMattress = async (productMattress) => {
    return ProductMattress.addProductMattress(productMattress);
}

/* 取得床墊商品 */
exports.getProductMattress = async (id) => {
    return ProductMattress.getProductMattress(id);
}

/* 更新床墊商品 */
exports.updateProductMattress = async (productMattress) => {
    return ProductMattress.updateProductMattress(productMattress);
}

/* 刪除床墊商品 */
exports.deleteProductMattress = async (id) => {
    return ProductMattress.deleteProductMattress(id);
}

/* 匯入床墊商品 */
exports.importProductMattress = async (productMattressList) => {
    return ProductMattress.importProductMattress(productMattressList);
}

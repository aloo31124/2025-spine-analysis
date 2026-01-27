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

/* 取得床墊商品列表（含創建者資訊） */
exports.getProductMattressList = async (userId = null) => {
    const User = require('../models/user.model');
    
    try {
        console.log("[getProductMattressList] start :");
        let productMattressList = await ProductMattress.getAllProductMattressList();
        
        // 如果提供 userId，則只返回該用戶的商品
        if (userId) {
            productMattressList = productMattressList.filter(p => p.userId === userId);
        }
        
        // 取得所有用戶資料用於查詢創建者名稱
        const allUsers = await User.getAllUserList();
        const userMap = new Map(allUsers.map(u => [u.id, u]));
        
        // 為每個商品添加創建者資訊
        productMattressList = productMattressList.map(product => {
            // 如果沒有 createId，使用 userId 作為預設值（舊資料相容）
            const createId = product.createId || product.userId;
            const creator = userMap.get(createId);
            
            return {
                ...product,
                createId: createId,
                creatorName: creator?.account || creator?.mail || createId,
                creatorEmail: creator?.mail || ''
            };
        });
        
        console.log("[getProductMattressList] end , result count:", productMattressList.length);
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
        
        // 排序 - 按 createdAt 降序（最新的在前）
        if (sort === 'createdAt') {
            productMattressList = productMattressList.sort((a, b) => {
                const dateA = new Date(a.createDate || 0);
                const dateB = new Date(b.createDate || 0);
                return dateB - dateA; // 降序：最新的在前
            });
        } else if (sort) {
            // 其他欄位的升序排序
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


/**
 * 新增床墊商品
 * 
 * 【操作員商品綁定邏輯】
 * 1. 如果創建者是操作員：
 *    - userId（商品所有者）= 操作員綁定的店長ID
 *    - createId（實際創建者）= 操作員ID
 * 2. 如果創建者不是操作員（店長或其他角色）：
 *    - userId = createId = 創建者自己的ID
 * 
 * @param {Object} productMattress - 床墊商品資料
 * @throws {Error} 如果操作員未綁定店長
 */
exports.addProductMattress = async (productMattress) => {
    const storeManagerToOperatorService = require('./storeManagerToOperator.service');
    const userToRoleService = require('./userToRole.service');
    
    // 步驟1: 檢查當前用戶是否為操作員角色
    const isOperator = await storeManagerToOperatorService.isOperator(productMattress.userId);
    
    if (isOperator) {
        // 步驟2: 操作員必須綁定店長才能創建商品
        const storeManagerId = await storeManagerToOperatorService.getStoreManagerIdByOperatorId(productMattress.userId);
        
        if (!storeManagerId) {
            // 操作員未綁定店長，拒絕創建商品
            throw new Error('操作員未綁定店長');
        }
        
        // 步驟3: 設置商品歸屬關係
        // - createId: 保存操作員ID作為實際創建者
        // - userId: 設置為店長ID作為商品所有者
        const createId = productMattress.userId;
        
        console.log(`[操作員創建床墊商品] 操作員ID: ${createId}, 店長ID: ${storeManagerId}`);
        return ProductMattress.addProductMattress({
            ...productMattress,
            userId: storeManagerId,
            createId: createId
        });
    }
    
    // 非操作員（店長或其他角色）：createId 與 userId 相同
    console.log(`[非操作員創建床墊商品] userId/createId: ${productMattress.userId}`);
    return ProductMattress.addProductMattress({
        ...productMattress,
        createId: productMattress.userId
    });
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

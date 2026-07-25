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
    const storeManagerToOperatorService = require('./storeManagerToOperator.service');
    
    try {
        console.log("[getProductMattressList] start :");
        let productMattressList = await ProductMattress.getAllProductMattressList();
        
        // 如果提供 userId，則根據角色決定篩選邏輯
        if (userId) {
            // 檢查是否為操作員角色
            const isOperator = await storeManagerToOperatorService.isOperator(userId);
            
            if (isOperator) {
                // 操作員：查詢綁定店長的所有商品
                const storeManagerId = await storeManagerToOperatorService.getStoreManagerIdByOperatorId(userId);
                if (storeManagerId) {
                    console.log(`[操作員查詢床墊商品] 操作員ID: ${userId}, 店長ID: ${storeManagerId}`);
                    productMattressList = productMattressList.filter(p => p.userId === storeManagerId);
                } else {
                    // 操作員未綁定店長，返回空列表
                    console.log(`[操作員查詢床墊商品] 操作員未綁定店長: ${userId}`);
                    productMattressList = [];
                }
            } else {
                // 店長或其他角色：查詢自己的商品
                productMattressList = productMattressList.filter(p => p.userId === userId);
            }
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
    const storeManagerToOperatorService = require('./storeManagerToOperator.service');
    
    try {
        console.log("[searchProductMattress] start :");
        const { 
            keyword,           // 名稱模糊搜尋
            model,             // 型號搜尋
            stateList,         // 狀態多選搜尋 (陣列)
            state,             // 狀態單選搜尋 (向下相容)
            priceMin, priceMax // 價格範圍
        } = searchParam;
        
        // 如果提供 userId，根據角色決定實際查詢的所有者 ID
        let effectiveUserId = userId;
        if (userId) {
            const isOperator = await storeManagerToOperatorService.isOperator(userId);
            if (isOperator) {
                // 操作員：查詢綁定店長的商品
                const storeManagerId = await storeManagerToOperatorService.getStoreManagerIdByOperatorId(userId);
                if (storeManagerId) {
                    console.log(`[操作員搜尋床墊商品] 操作員ID: ${userId}, 店長ID: ${storeManagerId}`);
                    effectiveUserId = storeManagerId;
                } else {
                    console.log(`[操作員搜尋床墊商品] 操作員未綁定店長: ${userId}`);
                    effectiveUserId = null; // 未綁定則返回空結果
                }
            }
        }
        
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
            
            // userId 篩選（使用 effectiveUserId - 操作員時為店長ID）
            const matchUserId = effectiveUserId ? product.userId === effectiveUserId : true;
            
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
    const loggerService = require('./logger.service');
    const admin = require('firebase-admin');
    
    // 步驟1: 檢查當前用戶是否為操作員角色
    const isOperator = await storeManagerToOperatorService.isOperator(productMattress.userId);
    
    if (isOperator) {
        // 步驟2: 操作員必須綁定店長才能創建商品
        const storeManagerId = await storeManagerToOperatorService.getStoreManagerIdByOperatorId(productMattress.userId);
        
        if (!storeManagerId) {
            // 操作員未綁定店長，拒絕創建商品
            throw new Error('操作員未綁定店長');
        }
        
        // 步驟3: 設置商品歸屬關係與追蹤欄位
        // - createId: 保存操作員ID作為實際創建者
        // - userId: 設置為店長ID作為商品所有者
        // - lastEditId: 初始編輯者為創建者
        // - lastEditTime: 使用伺服器時間戳
        // - version: 初始版本號為 1
        const createId = productMattress.userId;
        
        console.log(`[操作員創建床墊商品] 操作員ID: ${createId}, 店長ID: ${storeManagerId}`);
        
        const newProduct = await ProductMattress.addProductMattress({
            ...productMattress,
            userId: storeManagerId,
            createId: createId,
            lastEditId: createId,
            lastEditTime: admin.firestore.FieldValue.serverTimestamp(),
            version: 1
        });
        
        // 記錄創建操作
        await loggerService.logProductAction('CREATE', newProduct.id, createId, null, newProduct);
        
        return newProduct;
    }
    
    // 非操作員（店長或其他角色）：createId 與 userId 相同
    console.log(`[非操作員創建床墊商品] userId/createId: ${productMattress.userId}`);
    
    const newProduct = await ProductMattress.addProductMattress({
        ...productMattress,
        createId: productMattress.userId,
        lastEditId: productMattress.userId,
        lastEditTime: admin.firestore.FieldValue.serverTimestamp(),
        version: 1
    });
    
    // 記錄創建操作
    await loggerService.logProductAction('CREATE', newProduct.id, productMattress.userId, null, newProduct);
    
    return newProduct;
}

/* 取得床墊商品 */
exports.getProductMattress = async (id) => {
    return ProductMattress.getProductMattress(id);
}

/* 更新床墊商品 */
exports.updateProductMattress = async (productMattress, currentUserId) => {
    const storeManagerToOperatorService = require('./storeManagerToOperator.service');
    const loggerService = require('./logger.service');
    const admin = require('firebase-admin');
    const db = require('../firestore');
    
    try {
        // 步驟1: 取得現有商品資料
        const existingProduct = await ProductMattress.getProductMattress(productMattress.id);
        if (!existingProduct) {
            throw new Error('商品不存在');
        }
        
        // 步驟2: 版本檢查（樂觀鎖）
        if (productMattress.version !== undefined && existingProduct.version !== undefined) {
            if (productMattress.version !== existingProduct.version) {
                // 版本衝突
                const error = new Error('商品已被其他用戶修改，請重新載入');
                error.code = 'VERSION_CONFLICT';
                error.latestProduct = existingProduct;
                throw error;
            }
        }
        
        // 步驟3: 權限檢查
        const isOperator = await storeManagerToOperatorService.isOperator(currentUserId);
        if (isOperator) {
            // 操作員：驗證商品所有者是否為綁定的店長
            const storeManagerId = await storeManagerToOperatorService.getStoreManagerIdByOperatorId(currentUserId);
            if (!storeManagerId || existingProduct.userId !== storeManagerId) {
                throw new Error('無權編輯此商品');
            }
        } else {
            // 店長或其他角色：驗證商品所有者是否為自己
            if (existingProduct.userId !== currentUserId) {
                throw new Error('無權編輯此商品');
            }
        }
        
        // 步驟4: 準備更新資料（確保 userId 和 createId 不可修改）
        const updateData = {
            ...productMattress,
            userId: existingProduct.userId,           // 不可修改
            createId: existingProduct.createId,       // 不可修改
            lastEditId: currentUserId,                // 更新為當前編輯者
            lastEditTime: admin.firestore.FieldValue.serverTimestamp(), // 更新編輯時間
            version: (existingProduct.version || 0) + 1  // 版本號 +1
        };
        
        // 步驟5: 使用交易更新商品
        // 步驟6: 取得更新後的商品資料
        const updatedProduct = await ProductMattress.updateProductMattress(productMattress);
        
        // 步驟7: 記錄更新操作
        await loggerService.logProductAction('UPDATE', productMattress.id, currentUserId, existingProduct, updatedProduct);
        
        console.log(`[更新床墊商品] 商品ID: ${productMattress.id}, 編輯者: ${currentUserId}, 版本: ${updateData.version}`);
        return updatedProduct;
    } catch (error) {
        console.error('[updateProductMattress] error:', error);
        throw error;
    }
}

/* 刪除床墊商品 */
exports.deleteProductMattress = async (id, currentUserId) => {
    const storeManagerToOperatorService = require('./storeManagerToOperator.service');
    const loggerService = require('./logger.service');
    
    try {
        // 步驟1: 取得商品資料用於日誌記錄
        const product = await ProductMattress.getProductMattress(id);
        if (!product) {
            throw new Error('商品不存在');
        }
        
        // 步驟2: 權限檢查 - 僅店長可刪除
        const isOperator = await storeManagerToOperatorService.isOperator(currentUserId);
        if (isOperator) {
            // 操作員無刪除權限
            const error = new Error('操作員無商品刪除權限');
            error.code = 'OPERATOR_CANNOT_DELETE';
            throw error;
        }
        
        // 步驟3: 驗證店長是否為商品所有者
        if (product.userId !== currentUserId) {
            throw new Error('無權刪除此商品');
        }
        
        // 步驟4: 執行刪除
        await ProductMattress.deleteProductMattress(id);
        
        // 步驟5: 記錄刪除操作
        await loggerService.logProductAction('DELETE', id, currentUserId, product, null);
        
        console.log(`[刪除床墊商品] 商品ID: ${id}, 操作者: ${currentUserId}`);
        return { success: true, message: '商品刪除成功' };
    } catch (error) {
        console.error('[deleteProductMattress] error:', error);
        throw error;
    }
}

/* 匯入床墊商品 */
exports.importProductMattress = async (productMattressList) => {
    return ProductMattress.importProductMattress(productMattressList);
}

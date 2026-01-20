/*
 * [模型層] StoreToStock 店面庫存表
 * 儲存店面與商品的庫存關聯
 */

const db = require('../firestore');
const COLLECTION_NAME = 'StoreToStock';

class StoreToStock {
    constructor(data) {
        this.id = data.id || null;
        this.productId = data.productId || '';           // 商品 ID
        this.productType = data.productType || '';       // 商品類型: Pillow、Mattress
        this.storeId = data.storeId || '';               // 店面 ID
        this.stock = data.stock || 0;                    // 庫存數量
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    /**
     * 新增庫存紀錄
     */
    static async add(stockData) {
        try {
            console.log('[StoreToStock.add] 開始新增:', stockData);
            const newStock = new StoreToStock(stockData);
            const docRef = await db.collection(COLLECTION_NAME).add({
                productId: newStock.productId,
                productType: newStock.productType,
                storeId: newStock.storeId,
                stock: newStock.stock,
                createdAt: newStock.createdAt,
                updatedAt: newStock.updatedAt
            });
            
            newStock.id = docRef.id;
            console.log('[StoreToStock.add] 新增成功:', newStock);
            return newStock;
        } catch (error) {
            console.error('[StoreToStock.add] 錯誤:', error);
            throw error;
        }
    }

    /**
     * 根據 ID 查詢庫存
     */
    static async findById(id) {
        try {
            const doc = await db.collection(COLLECTION_NAME).doc(id).get();
            if (!doc.exists) {
                return null;
            }
            return new StoreToStock({ id: doc.id, ...doc.data() });
        } catch (error) {
            console.error('[StoreToStock.findById] 錯誤:', error);
            throw error;
        }
    }

    /**
     * 根據商品 ID 和店面 ID 查詢庫存
     */
    static async findByProductAndStore(productId, storeId) {
        try {
            console.log('[StoreToStock.findByProductAndStore] 查詢:', { productId, storeId });
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('productId', '==', productId)
                .where('storeId', '==', storeId)
                .get();
            
            if (snapshot.empty) {
                return null;
            }
            
            const doc = snapshot.docs[0];
            return new StoreToStock({ id: doc.id, ...doc.data() });
        } catch (error) {
            console.error('[StoreToStock.findByProductAndStore] 錯誤:', error);
            throw error;
        }
    }

    /**
     * 根據商品 ID 查詢所有店面的庫存
     */
    static async findByProductId(productId) {
        try {
            console.log('[StoreToStock.findByProductId] 查詢:', productId);
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('productId', '==', productId)
                .get();
            
            const stockList = [];
            snapshot.forEach(doc => {
                stockList.push(new StoreToStock({ id: doc.id, ...doc.data() }));
            });
            
            console.log('[StoreToStock.findByProductId] 找到', stockList.length, '筆庫存');
            return stockList;
        } catch (error) {
            console.error('[StoreToStock.findByProductId] 錯誤:', error);
            throw error;
        }
    }

    /**
     * 根據店面 ID 查詢所有商品的庫存
     */
    static async findByStoreId(storeId) {
        try {
            console.log('[StoreToStock.findByStoreId] 查詢:', storeId);
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('storeId', '==', storeId)
                .get();
            
            const stockList = [];
            snapshot.forEach(doc => {
                stockList.push(new StoreToStock({ id: doc.id, ...doc.data() }));
            });
            
            console.log('[StoreToStock.findByStoreId] 找到', stockList.length, '筆庫存');
            return stockList;
        } catch (error) {
            console.error('[StoreToStock.findByStoreId] 錯誤:', error);
            throw error;
        }
    }

    /**
     * 根據店面 ID 列表和商品類型查詢庫存
     */
    static async findByStoreIdsAndType(storeIds, productType) {
        try {
            console.log('[StoreToStock.findByStoreIdsAndType] 查詢:', { storeIds, productType });
            
            if (!storeIds || storeIds.length === 0) {
                return [];
            }

            // Firestore 的 in 查詢限制最多 10 個值
            const chunks = [];
            for (let i = 0; i < storeIds.length; i += 10) {
                chunks.push(storeIds.slice(i, i + 10));
            }

            const stockList = [];
            for (const chunk of chunks) {
                const snapshot = await db.collection(COLLECTION_NAME)
                    .where('storeId', 'in', chunk)
                    .where('productType', '==', productType)
                    .get();
                
                snapshot.forEach(doc => {
                    stockList.push(new StoreToStock({ id: doc.id, ...doc.data() }));
                });
            }
            
            console.log('[StoreToStock.findByStoreIdsAndType] 找到', stockList.length, '筆庫存');
            return stockList;
        } catch (error) {
            console.error('[StoreToStock.findByStoreIdsAndType] 錯誤:', error);
            throw error;
        }
    }

    /**
     * 更新庫存
     */
    static async update(id, updateData) {
        try {
            console.log('[StoreToStock.update] 更新:', { id, updateData });
            const docRef = db.collection(COLLECTION_NAME).doc(id);
            
            await docRef.update({
                ...updateData,
                updatedAt: new Date()
            });
            
            const updatedDoc = await docRef.get();
            console.log('[StoreToStock.update] 更新成功');
            return new StoreToStock({ id: updatedDoc.id, ...updatedDoc.data() });
        } catch (error) {
            console.error('[StoreToStock.update] 錯誤:', error);
            throw error;
        }
    }

    /**
     * 更新或新增庫存 (Upsert)
     */
    static async upsert(stockData) {
        try {
            console.log('[StoreToStock.upsert] 開始:', stockData);
            const existing = await this.findByProductAndStore(stockData.productId, stockData.storeId);
            
            if (existing) {
                // 更新現有庫存
                return await this.update(existing.id, { stock: stockData.stock });
            } else {
                // 新增庫存
                return await this.add(stockData);
            }
        } catch (error) {
            console.error('[StoreToStock.upsert] 錯誤:', error);
            throw error;
        }
    }

    /**
     * 批量更新或新增庫存
     */
    static async batchUpsert(stockDataList) {
        try {
            console.log('[StoreToStock.batchUpsert] 開始批量更新:', stockDataList.length, '筆');
            const results = [];
            
            for (const stockData of stockDataList) {
                const result = await this.upsert(stockData);
                results.push(result);
            }
            
            console.log('[StoreToStock.batchUpsert] 批量更新成功');
            return results;
        } catch (error) {
            console.error('[StoreToStock.batchUpsert] 錯誤:', error);
            throw error;
        }
    }

    /**
     * 刪除庫存
     */
    static async delete(id) {
        try {
            console.log('[StoreToStock.delete] 刪除:', id);
            await db.collection(COLLECTION_NAME).doc(id).delete();
            console.log('[StoreToStock.delete] 刪除成功');
            return true;
        } catch (error) {
            console.error('[StoreToStock.delete] 錯誤:', error);
            throw error;
        }
    }

    /**
     * 根據商品 ID 刪除所有相關庫存
     */
    static async deleteByProductId(productId) {
        try {
            console.log('[StoreToStock.deleteByProductId] 刪除商品庫存:', productId);
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('productId', '==', productId)
                .get();
            
            const batch = db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            console.log('[StoreToStock.deleteByProductId] 刪除成功,', snapshot.size, '筆');
            return true;
        } catch (error) {
            console.error('[StoreToStock.deleteByProductId] 錯誤:', error);
            throw error;
        }
    }

    /**
     * 取得所有庫存
     */
    static async getAll() {
        try {
            const snapshot = await db.collection(COLLECTION_NAME).get();
            const stockList = [];
            
            snapshot.forEach(doc => {
                stockList.push(new StoreToStock({ id: doc.id, ...doc.data() }));
            });
            
            console.log('[StoreToStock.getAll] 找到', stockList.length, '筆庫存');
            return stockList;
        } catch (error) {
            console.error('[StoreToStock.getAll] 錯誤:', error);
            throw error;
        }
    }
}

module.exports = StoreToStock;

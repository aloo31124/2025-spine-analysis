/*
 * [model層] 負責店面 db 資料增刪修查
 */

const db = require('../firestore');
const COLLECTION_NAME = 'Store';

class Store {
    constructor({ id, name, region, address, phone, storeManagerId, notes, createdAt, updatedAt }) {
        this.id = id || "";
        this.name = name || "";
        this.region = region || "";
        this.address = address || "";
        this.phone = phone || "";
        this.storeManagerId = storeManagerId || null; // 所屬店長的 userId，可以為 null
        this.notes = notes || "";
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
    }

    /** 取得所有店面資訊 */
    static async getAllStoreList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        
        if (snapshot.empty) {
            return [];
        }

        const storeList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return storeList;
    }

    /** 新增店面 */
    static async addStore(storeData) {
        try {
            const store = new Store(storeData);
            const { id, ...storeWithoutId } = store;
            const docRef = await db.collection(COLLECTION_NAME).add(storeWithoutId);
            const docSnapshot = await docRef.get();
            
            return {
                id: docRef.id,
                ...docSnapshot.data()
            };
        } catch (error) {
            console.error('[Store.addStore] 錯誤:', error);
            throw error;
        }
    }

    /** 取得單一店面 */
    static async getStore(id) {
        try {
            const docSnapshot = await db.collection(COLLECTION_NAME).doc(id).get();
            
            if (!docSnapshot.exists) {
                throw new Error(`找不到 ID 為 ${id} 的店面`);
            }

            return {
                id: docSnapshot.id,
                ...docSnapshot.data()
            };
        } catch (error) {
            console.error('[Store.getStore] 錯誤:', error);
            throw error;
        }
    }

    /** 更新店面 */
    static async updateStore(storeData) {
        try {
            const { id, ...updateData } = storeData;
            updateData.updatedAt = new Date().toISOString();
            
            await db.collection(COLLECTION_NAME).doc(id).update(updateData);
            
            return {
                id,
                ...updateData
            };
        } catch (error) {
            console.error('[Store.updateStore] 錯誤:', error);
            throw error;
        }
    }

    /** 刪除店面 */
    static async deleteStore(id) {
        try {
            await db.collection(COLLECTION_NAME).doc(id).delete();
            return { message: '店面刪除成功' };
        } catch (error) {
            console.error('[Store.deleteStore] 錯誤:', error);
            throw error;
        }
    }

    /** 根據店長 ID 查詢該店長管理的店面 */
    static async getStoresByStoreManagerId(storeManagerId) {
        try {
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('storeManagerId', '==', storeManagerId)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('[Store.getStoresByStoreManagerId] 錯誤:', error);
            throw error;
        }
    }

    /** 匯入店面資料（用於備份還原） */
    static async importAllStore(storeList) {
        try {
            // 檢查表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllStore]: 表已存在資料，匯入中止。');
                return { message: '表已存在資料，匯入中止。' };
            }

            // 表無資料，開始匯入
            const batch = db.batch();
            storeList.forEach(storeData => {
                const store = new Store({
                    id: storeData.id || "",
                    name: storeData.name || "",
                    region: storeData.region || "",
                    address: storeData.address || "",
                    phone: storeData.phone || "",
                    storeManagerId: storeData.storeManagerId || null,
                    notes: storeData.notes || "",
                    createdAt: storeData.createdAt || new Date().toISOString(),
                    updatedAt: storeData.updatedAt || new Date().toISOString()
                });

                const { id, ...storeWithoutId } = store;
                const docRef = db.collection(COLLECTION_NAME).doc(id);
                batch.set(docRef, storeWithoutId);
            });

            await batch.commit();
            console.log('[importAllStore]: 匯入成功。');
            return { message: '匯入成功' };
        } catch (error) {
            console.error('[importAllStore] 錯誤:', error);
            throw error;
        }
    }
}

module.exports = Store;

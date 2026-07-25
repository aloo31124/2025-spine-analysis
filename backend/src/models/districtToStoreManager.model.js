/*
 * [model層] 負責區域與店長綁定關係 db 資料增刪修查
 */

const db = require('../firestore');
const COLLECTION_NAME = 'DistrictToStoreManager';

class DistrictToStoreManager {
    constructor({ id, districtId, storeManagerUserId, createdAt, updatedAt }) {
        this.id = id || "";
        this.districtId = districtId || "";
        this.storeManagerUserId = storeManagerUserId || "";
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
    }

    /** 根據區域 ID 取得綁定的店長列表 */
    static async getStoreManagersByDistrictId(districtId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('districtId', '==', districtId)
            .get();
        
        if (snapshot.empty) {
            return [];
        }

        const bindings = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return bindings;
    }

    /** 根據店長 userId 取得綁定的區域列表 */
    static async getDistrictsByStoreManagerUserId(storeManagerUserId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('storeManagerUserId', '==', storeManagerUserId)
            .get();
        
        if (snapshot.empty) {
            return [];
        }

        const bindings = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return bindings;
    }

    /** 新增綁定關係 */
    static async addBinding(bindingData) {
        try {
            const binding = new DistrictToStoreManager(bindingData);
            const { id, ...bindingWithoutId } = binding;
            const docRef = await db.collection(COLLECTION_NAME).add(bindingWithoutId);
            const docSnapshot = await docRef.get();
            
            return {
                id: docRef.id,
                ...docSnapshot.data()
            };
        } catch (error) {
            console.error('[DistrictToStoreManager.addBinding] 錯誤:', error);
            throw error;
        }
    }

    /** 刪除綁定關係 */
    static async deleteBinding(id) {
        try {
            await db.collection(COLLECTION_NAME).doc(id).delete();
            return { message: '綁定關係刪除成功' };
        } catch (error) {
            console.error('[DistrictToStoreManager.deleteBinding] 錯誤:', error);
            throw error;
        }
    }

    /** 刪除區域的所有綁定關係 */
    static async deleteByDistrictId(districtId) {
        try {
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('districtId', '==', districtId)
                .get();
            
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            return { message: '區域的所有綁定關係刪除成功' };
        } catch (error) {
            console.error('[DistrictToStoreManager.deleteByDistrictId] 錯誤:', error);
            throw error;
        }
    }

    /** 刪除店長的所有綁定關係 */
    static async deleteByStoreManagerUserId(storeManagerUserId) {
        try {
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('storeManagerUserId', '==', storeManagerUserId)
                .get();
            
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            return { message: '店長的所有綁定關係刪除成功' };
        } catch (error) {
            console.error('[DistrictToStoreManager.deleteByStoreManagerUserId] 錯誤:', error);
            throw error;
        }
    }
}

module.exports = DistrictToStoreManager;

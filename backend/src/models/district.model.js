/*
 * [model層] 負責區域 db 資料增刪修查
 */

const db = require('../firestore');
const COLLECTION_NAME = 'District';

class District {
    constructor({ id, name, createdAt, updatedAt }) {
        this.id = id || "";
        this.name = name || "";
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
    }

    /** 取得所有區域資訊 */
    static async getAllDistrictList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        
        if (snapshot.empty) {
            return [];
        }

        const districtList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return districtList;
    }

    /** 新增區域 */
    static async addDistrict(districtData) {
        try {
            const district = new District(districtData);
            const { id, ...districtWithoutId } = district;
            const docRef = await db.collection(COLLECTION_NAME).add(districtWithoutId);
            const docSnapshot = await docRef.get();
            
            return {
                id: docRef.id,
                ...docSnapshot.data()
            };
        } catch (error) {
            console.error('[District.addDistrict] 錯誤:', error);
            throw error;
        }
    }

    /** 取得單一區域 */
    static async getDistrict(id) {
        try {
            const docSnapshot = await db.collection(COLLECTION_NAME).doc(id).get();
            
            if (!docSnapshot.exists) {
                throw new Error(`找不到 ID 為 ${id} 的區域`);
            }

            return {
                id: docSnapshot.id,
                ...docSnapshot.data()
            };
        } catch (error) {
            console.error('[District.getDistrict] 錯誤:', error);
            throw error;
        }
    }

    /** 更新區域 */
    static async updateDistrict(districtData) {
        try {
            const { id, ...updateData } = districtData;
            updateData.updatedAt = new Date().toISOString();
            
            await db.collection(COLLECTION_NAME).doc(id).update(updateData);
            
            return {
                id,
                ...updateData
            };
        } catch (error) {
            console.error('[District.updateDistrict] 錯誤:', error);
            throw error;
        }
    }

    /** 刪除區域 */
    static async deleteDistrict(id) {
        try {
            await db.collection(COLLECTION_NAME).doc(id).delete();
            return { message: '區域刪除成功' };
        } catch (error) {
            console.error('[District.deleteDistrict] 錯誤:', error);
            throw error;
        }
    }
}

module.exports = District;

const db = require('../firestore');
const COLLECTION_NAME = 'StoreManagerToOperator';

/**
 * [模型層] 店長綁定操作員
 * 儲存店長與操作員的綁定關係
 */
class StoreManagerToOperator {

    constructor(id, storeManagerId, operatorId, createdAt, updatedAt) {
        this.id = id;
        this.storeManagerId = storeManagerId;  // 店長的 userId
        this.operatorId = operatorId;          // 操作員的 userId
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // 新增店長綁定操作員
    static async add(data) {
        const now = new Date().toISOString();
        const binding = {
            storeManagerId: data.storeManagerId,
            operatorId: data.operatorId,
            createdAt: now,
            updatedAt: now
        };
        const docRef = await db.collection(COLLECTION_NAME).add(binding);
        const docSnapshot = await docRef.get();
        return { id: docRef.id, ...docSnapshot.data() };
    }

    // 根據店長ID查詢所有綁定的操作員
    static async findByStoreManagerId(storeManagerId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('storeManagerId', '==', storeManagerId)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // 根據操作員ID查詢綁定的店長
    static async findByOperatorId(operatorId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('operatorId', '==', operatorId)
            .get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    // 檢查操作員是否已被綁定
    static async isOperatorBound(operatorId) {
        const binding = await this.findByOperatorId(operatorId);
        return !!binding;
    }

    // 刪除綁定關係（根據 binding ID）
    static async delete(id) {
        await db.collection(COLLECTION_NAME).doc(id).delete();
        return { success: true, message: '綁定關係已刪除' };
    }

    // 根據操作員ID刪除綁定關係
    static async deleteByOperatorId(operatorId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('operatorId', '==', operatorId)
            .get();
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        return { success: true, message: '操作員綁定已刪除' };
    }

    // 搜尋綁定關係（支援分頁）
    static async search(searchParam, pagingParam) {
        const { storeManagerId, operatorId } = searchParam;
        let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam;
        
        let query = db.collection(COLLECTION_NAME);
        const snapshot = await query.get();
        let bindingList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // 篩選條件
        bindingList = bindingList.filter(item => 
            (storeManagerId ? item.storeManagerId === storeManagerId : true) &&
            (operatorId ? item.operatorId === operatorId : true)
        );
        
        // 排序
        bindingList = bindingList.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // 分頁設定
        dataTotal = bindingList.length;
        pageTotal = Math.ceil(bindingList.length / pageSize);
        bindingList = bindingList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        
        return { 
            bindingList, 
            pagingParam: { ...pagingParam, pageTotal, dataTotal } 
        };
    }

    // 更新綁定資料
    static async update(id, data) {
        const now = new Date().toISOString();
        const updateData = {
            ...data,
            updatedAt: now
        };
        await db.collection(COLLECTION_NAME).doc(id).update(updateData);
        const docSnapshot = await db.collection(COLLECTION_NAME).doc(id).get();
        return { id, ...docSnapshot.data() };
    }

    // 根據ID獲取單一綁定資料
    static async findById(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }
}

module.exports = StoreManagerToOperator;

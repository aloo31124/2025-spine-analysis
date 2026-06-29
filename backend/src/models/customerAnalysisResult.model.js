/*
 * [model層] 負責客戶分析結果 db 資料增刪修查
 */

const db = require('../firestore');
const COLLECTION_NAME = 'CustomerAnalysisResult';

class CustomerAnalysisResult {
    constructor(id, customerId, userId, analysisType, analysisData, points, lines, intersectionPoints, calculationResults, backgroundImage, createDate, updateDate) {
        this.id = id || "";
        this.customerId = customerId || "";
        this.userId = userId || "";
        this.analysisType = analysisType || "spine";
        this.analysisData = analysisData || {};
        this.points = points || [];
        this.lines = lines || [];
        this.intersectionPoints = intersectionPoints || [];
        this.calculationResults = calculationResults || [];
        this.backgroundImage = backgroundImage || "";
        this.createDate = createDate || new Date().toISOString();
        this.updateDate = updateDate || new Date().toISOString();
    }

    /** 匯入 所有 客戶分析結果 進入空表, 不卡控, 使用於備份還原。 */
    static async importAllCustomerAnalysisResult(resultList) {
        try {
            // 檢查表是否已存在資料
            const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
            if (!snapshot.empty) {
                console.log('[importAllCustomerAnalysisResult]: 表已存在資料，匯入中止。');
                return { message: '表已存在資料，匯入中止。' };
            }

            // 表無資料，開始匯入
            const batch = db.batch();
            resultList.forEach(resultData => {
                const result = new CustomerAnalysisResult(
                    resultData.id || "",
                    resultData.customerId || "",
                    resultData.userId || "",
                    resultData.analysisType || "spine",
                    resultData.analysisData || {},
                    resultData.points || [],
                    resultData.lines || [],
                    resultData.intersectionPoints || [],
                    resultData.calculationResults || [],
                    resultData.backgroundImage || "",
                    resultData.createDate || new Date().toISOString(),
                    resultData.updateDate || new Date().toISOString()
                );
                const docRef = db.collection(COLLECTION_NAME).doc(result.id.replace(/"/g, ''));
                batch.set(docRef, {
                    customerId: result.customerId.replace(/"/g, '') || "",
                    userId: result.userId.replace(/"/g, '') || "",
                    analysisType: result.analysisType.replace(/"/g, '') || "spine",
                    analysisData: result.analysisData,
                    points: result.points,
                    lines: result.lines,
                    intersectionPoints: result.intersectionPoints,
                    calculationResults: result.calculationResults,
                    backgroundImage: result.backgroundImage.replace(/"/g, '') || "",
                    createDate: result.createDate,
                    updateDate: result.updateDate
                });
            });

            await batch.commit();
            console.log('[importAllCustomerAnalysisResult]: 資料匯入成功。');
            return { message: '資料匯入成功。' };
        } catch (error) {
            console.error('[importAllCustomerAnalysisResult] error:', error);
            throw error;
        }
    }

    /* 取得 客戶分析結果 列表 */
    static async getAllCustomerAnalysisResultList() {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const resultList = [];
        snapshot.forEach(doc => {
            resultList.push({id: doc.id, ...doc.data()});
        });
        return resultList;
    }

    /* 根據客戶ID取得分析結果 */
    static async getCustomerAnalysisResultsByCustomerId(customerId) {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('customerId', '==', customerId)
            .get();
        const resultList = [];
        snapshot.forEach(doc => {
            resultList.push({id: doc.id, ...doc.data()});
        });
        // 在內存中排序，避免需要創建Firestore索引
        resultList.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
        return resultList;
    }
    
    /* 新增客戶分析結果 */
    static async addCustomerAnalysisResult(result) {
        const resultData = {
            ...result,
            createDate: new Date().toISOString(),
            updateDate: new Date().toISOString()
        };
        const docRef = await db.collection(COLLECTION_NAME).add(resultData);
        const docSnapshot = await docRef.get();
        console.log("新增客戶分析結果 : ", {id: docRef.id, ...docSnapshot.data()});
        return ({id: docRef.id, ...docSnapshot.data()});
    }
    
    /* 取得客戶分析結果 */
    static async getCustomerAnalysisResult(id) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) {
            console.log('找無此客戶分析結果');
            return null;
        }
        console.log("取得客戶分析結果 : ", {id: doc.id, ...doc.data()});
        return {id: doc.id, ...doc.data()};
    }
    
    /* 更新客戶分析結果 */
    static async updateCustomerAnalysisResult(result) {
        const updateData = {
            ...result,
            updateDate: new Date().toISOString()
        };
        const docRef = db.collection(COLLECTION_NAME).doc(result.id);
        await docRef.update(updateData);
        console.log("更新客戶分析結果 : ", updateData);
        return updateData;
    }
    
    /* 刪除客戶分析結果 */
    static async deleteCustomerAnalysisResult(id) {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
        console.log("刪除客戶分析結果 : ", id);
        return id;
    }
    
    /* 匯入客戶分析結果 */
    static async importCustomerAnalysisResult(resultList) {
        const batch = db.batch();
        resultList.forEach(result => {
            const resultData = {
                ...result,
                createDate: new Date().toISOString(),
                updateDate: new Date().toISOString()
            };
            const docRef = db.collection(COLLECTION_NAME).doc();
            batch.set(docRef, resultData);
        });
        await batch.commit();
        console.log("匯入客戶分析結果 : ", resultList);
        return resultList;
    }
}

module.exports = CustomerAnalysisResult;
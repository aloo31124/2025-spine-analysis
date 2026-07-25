/**
 * 資料庫遷移腳本 - Phase 2 新增欄位
 * 為現有商品新增 lastEditId, lastEditTime, version 欄位
 * 
 * 執行方式：node backend/src/migrations/add-phase2-fields.js
 */

const admin = require('firebase-admin');
const path = require('path');

// 初始化 Firebase Admin
const serviceAccount = require(path.resolve(__dirname, '../../firebase.json'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * 遷移枕頭商品（ProductPillow）
 */
async function migrateProductPillow() {
    console.log('[Migration] 開始遷移 ProductPillow...');
    
    try {
        const snapshot = await db.collection('ProductPillow').get();
        
        if (snapshot.empty) {
            console.log('[Migration] ProductPillow 集合為空，跳過');
            return { updated: 0, skipped: 0 };
        }

        const batch = db.batch();
        let updateCount = 0;
        let skipCount = 0;

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            
            // 檢查是否已有 version 欄位（已遷移過則跳過）
            if (data.version !== undefined) {
                skipCount++;
                return;
            }

            // 準備更新資料
            const updates = {
                version: 1,
                lastEditId: data.createId || data.userId || '',
                lastEditTime: data.updateDate || data.createDate || admin.firestore.FieldValue.serverTimestamp()
            };

            batch.update(doc.ref, updates);
            updateCount++;
        });

        if (updateCount > 0) {
            await batch.commit();
            console.log(`[Migration] ProductPillow 遷移完成：${updateCount} 筆更新，${skipCount} 筆跳過`);
        } else {
            console.log(`[Migration] ProductPillow 無需更新：${skipCount} 筆已遷移`);
        }

        return { updated: updateCount, skipped: skipCount };
    } catch (error) {
        console.error('[Migration] ProductPillow 遷移失敗:', error);
        throw error;
    }
}

/**
 * 遷移床墊商品（ProductMattress）
 */
async function migrateProductMattress() {
    console.log('[Migration] 開始遷移 ProductMattress...');
    
    try {
        const snapshot = await db.collection('ProductMattress').get();
        
        if (snapshot.empty) {
            console.log('[Migration] ProductMattress 集合為空，跳過');
            return { updated: 0, skipped: 0 };
        }

        const batch = db.batch();
        let updateCount = 0;
        let skipCount = 0;

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            
            // 檢查是否已有 version 欄位（已遷移過則跳過）
            if (data.version !== undefined) {
                skipCount++;
                return;
            }

            // 準備更新資料
            const updates = {
                version: 1,
                lastEditId: data.createId || data.userId || '',
                lastEditTime: data.updateDate || data.createDate || admin.firestore.FieldValue.serverTimestamp()
            };

            batch.update(doc.ref, updates);
            updateCount++;
        });

        if (updateCount > 0) {
            await batch.commit();
            console.log(`[Migration] ProductMattress 遷移完成：${updateCount} 筆更新，${skipCount} 筆跳過`);
        } else {
            console.log(`[Migration] ProductMattress 無需更新：${skipCount} 筆已遷移`);
        }

        return { updated: updateCount, skipped: skipCount };
    } catch (error) {
        console.error('[Migration] ProductMattress 遷移失敗:', error);
        throw error;
    }
}

/**
 * 主執行函式
 */
async function main() {
    console.log('==========================================');
    console.log('Phase 2 資料庫遷移腳本');
    console.log('==========================================');
    console.log('');

    try {
        // 遷移枕頭商品
        const pillowResult = await migrateProductPillow();
        
        // 遷移床墊商品
        const mattressResult = await migrateProductMattress();

        console.log('');
        console.log('==========================================');
        console.log('遷移總結：');
        console.log(`  ProductPillow: ${pillowResult.updated} 筆更新，${pillowResult.skipped} 筆跳過`);
        console.log(`  ProductMattress: ${mattressResult.updated} 筆更新，${mattressResult.skipped} 筆跳過`);
        console.log('==========================================');
        console.log('遷移完成！');

    } catch (error) {
        console.error('遷移過程中發生錯誤:', error);
        process.exit(1);
    } finally {
        // 關閉 Firebase 連接
        await admin.app().delete();
    }
}

// 執行遷移
main();

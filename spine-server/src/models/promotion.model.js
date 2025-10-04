const db = require('../firestore');
const COLLECTION_NAME = 'Promotion';

class Promotion {
    constructor({name}) {
        this.name = name || "無促銷名稱";
    }

    /** 搜尋 促銷方案 */
    static async searchPromotion(searchParam, pagingParam) {
        const {name} = searchParam;
        let { pageIndex, pageSize, sort, pageTotal, dataTotal } = pagingParam; // 分頁參數
        let query = db.collection(COLLECTION_NAME);
        const snapshot = await query.get();
        let promotionList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // 使用 Fuse.js 對 name 欄位進行模糊搜尋
        if(name) {
            const fuse = new Fuse(promotionList, {
                keys: ['name'],
                threshold: 0.3, // 設定匹配度（0 完全匹配，1 模糊匹配）
                includeScore: false,
            });
            promotionList = fuse.search(name).map(result => result.item);
        }
        // 其他欄位全文篩選
        promotionList = promotionList
            .sort((a, b) => a[sort] > b[sort] ? 1 : -1)
            /*
            .filter(result => 
                (state ? result.state === state : true)
                && (createDate ? result.createDate === createDate : true)
                && (type ? result.type === type : true)
            );
            */
        // 分頁
        dataTotal = (promotionList.length);
        pageTotal = Math.ceil(promotionList.length / pageSize);
        promotionList = promotionList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        return {promotionList, pagingParam:{...pagingParam, pageTotal, dataTotal}};
    }
}
module.exports = Promotion;


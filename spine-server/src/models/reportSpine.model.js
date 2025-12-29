const db = require('../firestore');

const CUSTOMER_COLLECTION = 'CustomerToProductPillow';
const PRODUCT_COLLECTION = 'ProductPillow';


class ReportSpineModel {
	/**
	 * 取得指定期間內的購買紀錄
	 * @param {Object} filter
	 * @param {string} filter.startDateISO - ISO 格式的開始時間 (含)
	 * @param {string} filter.endDateISO - ISO 格式的結束時間 (含)
	 * @param {string} filter.userId - 使用者ID (用於篩選當前使用者的資料)
	 * @returns {Promise<Array>} 購買紀錄清單
	 */
	static async fetchPurchaseRecords({ startDateISO, endDateISO, userId }) {
		let query = db.collection(CUSTOMER_COLLECTION);

		if (userId) {
			query = query.where('userId', '==', userId);
		}

		if (startDateISO) {
			query = query.where('purchaseDate', '>=', startDateISO);
		}

		if (endDateISO) {
			query = query.where('purchaseDate', '<=', endDateISO);
		}

		const snapshot = await query.get();
		return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	}

	/**
	 * 取得枕頭商品下拉選項
	 * @returns {Promise<Array<{id: string, name: string}>>}
	 */
	static async fetchProductPillowOptions() {
		const snapshot = await db.collection(PRODUCT_COLLECTION).get();
		return snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name || '未命名枕頭' }));
	}
}

module.exports = ReportSpineModel;

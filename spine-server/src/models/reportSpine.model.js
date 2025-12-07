const db = require('../firestore');

const CUSTOMER_COLLECTION = 'CustomerToProductPillow';
const PRODUCT_COLLECTION = 'ProductPillow';

class ReportSpineModel {
	/**
	 * 取得指定期間內的營收紀錄
	 * @param {Object} filter
	 * @param {string} filter.startDateISO - ISO 格式的開始時間 (含)
	 * @param {string} filter.endDateISO - ISO 格式的結束時間 (含)
	 * @returns {Promise<Array>} 購買紀錄清單
	 */
	static async fetchRevenueRecords({ startDateISO, endDateISO }) {
		let query = db.collection(CUSTOMER_COLLECTION);

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

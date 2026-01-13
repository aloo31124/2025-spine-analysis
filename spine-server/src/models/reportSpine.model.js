const db = require('../firestore');

const CUSTOMER_PILLOW_COLLECTION = 'CustomerToProductPillow';
const CUSTOMER_MATTRESS_COLLECTION = 'CustomerToProductMattress';
const PRODUCT_PILLOW_COLLECTION = 'ProductPillow';
const PRODUCT_MATTRESS_COLLECTION = 'ProductMattress';


class ReportSpineModel {
	/**
	 * 取得指定期間內的購買紀錄
	 * @param {Object} filter
	 * @param {string} filter.startDateISO - ISO 格式的開始時間 (含)
	 * @param {string} filter.endDateISO - ISO 格式的結束時間 (含)
	 * @param {string} filter.userId - 使用者ID (用於篩選當前使用者的資料)
	 * @param {string} filter.productType - 商品類型 ('pillow', 'mattress', 'all')
	 * @returns {Promise<Array>} 購買紀錄清單
	 */
	static async fetchPurchaseRecords({ startDateISO, endDateISO, userId, productType = 'all' }) {
		const collections = [];
		
		if (productType === 'pillow' || productType === 'all') {
			collections.push(CUSTOMER_PILLOW_COLLECTION);
		}
		
		if (productType === 'mattress' || productType === 'all') {
			collections.push(CUSTOMER_MATTRESS_COLLECTION);
		}

		const allRecords = [];

		for (const collectionName of collections) {
			let query = db.collection(collectionName);

			/* 無 userId 欄位
			if (userId) {
				query = query.where('userId', '==', userId);
			}
			*/

			if (startDateISO) {
				query = query.where('purchaseDate', '>=', startDateISO);
			}

			if (endDateISO) {
				query = query.where('purchaseDate', '<=', endDateISO);
			}

			const snapshot = await query.get();
			const records = snapshot.docs.map(doc => ({ 
				id: doc.id, 
				...doc.data(),
				_collectionType: collectionName === CUSTOMER_PILLOW_COLLECTION ? 'pillow' : 'mattress'
			}));
			allRecords.push(...records);
		}

		return allRecords;
	}

	/**
	 * 取得商品下拉選項（枕頭、床墊或全部）
	 * @param {string} productType - 商品類型 ('pillow', 'mattress', 'all')
	 * @returns {Promise<Array<{id: string, name: string}>>}
	 */
	static async fetchProductOptions(productType = 'all') {
		const allOptions = [];

		if (productType === 'pillow' || productType === 'all') {
			const pillowSnapshot = await db.collection(PRODUCT_PILLOW_COLLECTION).get();
			const pillowOptions = pillowSnapshot.docs.map(doc => ({ 
				id: doc.id, 
				name: doc.data().name || '未命名枕頭',
				type: 'pillow'
			}));
			allOptions.push(...pillowOptions);
		}

		if (productType === 'mattress' || productType === 'all') {
			const mattressSnapshot = await db.collection(PRODUCT_MATTRESS_COLLECTION).get();
			const mattressOptions = mattressSnapshot.docs.map(doc => ({ 
				id: doc.id, 
				name: doc.data().name || '未命名床墊',
				type: 'mattress'
			}));
			allOptions.push(...mattressOptions);
		}

		return allOptions;
	}
}

module.exports = ReportSpineModel;

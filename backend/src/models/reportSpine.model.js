const db = require('../firestore');

const CUSTOMER_PILLOW_COLLECTION = 'CustomerToProductPillow';
const CUSTOMER_MATTRESS_COLLECTION = 'CustomerToProductMattress';
const PRODUCT_PILLOW_COLLECTION = 'ProductPillow';
const PRODUCT_MATTRESS_COLLECTION = 'ProductMattress';


class ReportSpineModel {
	/**
	 * 取得店長所屬的商品 ID 列表
	 * @param {string} userId - 店長的 userId
	 * @param {string} productType - 商品類型 ('pillow', 'mattress', 'all')
	 * @returns {Promise<{pillowIds: Array<string>, mattressIds: Array<string>}>}
	 */
	static async fetchStoreManagerProductIds(userId, productType = 'all') {
		const result = { pillowIds: [], mattressIds: [] };

		if (productType === 'pillow' || productType === 'all') {
			const pillowSnapshot = await db.collection(PRODUCT_PILLOW_COLLECTION)
				.where('userId', '==', userId)
				.get();
			result.pillowIds = pillowSnapshot.docs.map(doc => doc.id);
		}

		if (productType === 'mattress' || productType === 'all') {
			const mattressSnapshot = await db.collection(PRODUCT_MATTRESS_COLLECTION)
				.where('userId', '==', userId)
				.get();
			result.mattressIds = mattressSnapshot.docs.map(doc => doc.id);
		}

		return result;
	}

	/**
	 * 取得指定期間內的購買紀錄
	 * @param {Object} filter
	 * @param {string} filter.startDateISO - ISO 格式的開始時間 (含)
	 * @param {string} filter.endDateISO - ISO 格式的結束時間 (含)
	 * @param {string} filter.userId - 使用者ID (用於篩選當前使用者的資料)
	 * @param {string} filter.productType - 商品類型 ('pillow', 'mattress', 'all')
	 * @param {Object} filter.storeManagerProductIds - 店長商品 ID (可選)
	 * @returns {Promise<Array>} 購買紀錄清單
	 */
	static async fetchPurchaseRecords({ startDateISO, endDateISO, userId, productType = 'all', storeManagerProductIds = null }) {
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
			let records = snapshot.docs.map(doc => ({ 
				id: doc.id, 
				...doc.data(),
				_collectionType: collectionName === CUSTOMER_PILLOW_COLLECTION ? 'pillow' : 'mattress'
			}));

			// 如果有店長商品 ID 限制，進行篩選
			if (storeManagerProductIds) {
				const isPillowCollection = collectionName === CUSTOMER_PILLOW_COLLECTION;
				const allowedIds = isPillowCollection 
					? storeManagerProductIds.pillowIds 
					: storeManagerProductIds.mattressIds;
				
				if (allowedIds && allowedIds.length > 0) {
					records = records.filter(record => 
						allowedIds.includes(record.productPillowId) || 
						allowedIds.includes(record.productMattressId)
					);
				} else {
					// 如果該類型沒有商品，返回空陣列
					records = [];
				}
			}

			allRecords.push(...records);
		}

		return allRecords;
	}

	/**
	 * 取得商品下拉選項（枕頭、床墊或全部）
	 * @param {string} productType - 商品類型 ('pillow', 'mattress', 'all')
	 * @param {string} userId - 店長的 userId (可選，用於篩選店長商品)
	 * @returns {Promise<Array<{id: string, name: string}>>}
	 */
	static async fetchProductOptions(productType = 'all', userId = null) {
		const allOptions = [];

		if (productType === 'pillow' || productType === 'all') {
			let pillowQuery = db.collection(PRODUCT_PILLOW_COLLECTION);
			
			// 如果有 userId，只取該店長的商品
			if (userId) {
				pillowQuery = pillowQuery.where('userId', '==', userId);
			}
			
			const pillowSnapshot = await pillowQuery.get();
			const pillowOptions = pillowSnapshot.docs.map(doc => ({ 
				id: doc.id, 
				name: doc.data().name || '未命名枕頭',
				type: 'pillow'
			}));
			allOptions.push(...pillowOptions);
		}

		if (productType === 'mattress' || productType === 'all') {
			let mattressQuery = db.collection(PRODUCT_MATTRESS_COLLECTION);
			
			// 如果有 userId，只取該店長的商品
			if (userId) {
				mattressQuery = mattressQuery.where('userId', '==', userId);
			}
			
			const mattressSnapshot = await mattressQuery.get();
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

const ReportSpineModel = require('../models/reportSpine.model');
const UserToRoleService = require('./userToRole.service');

const DEFAULT_TIME_RANGE = 'day';

const RANGE_CONFIG = {
	day: { count: 100 },
	week: { count: 20 },
	month: { count: 18 },
	quarter: { count: 10 }
};

exports.getRevenueLineChartData = async ({ timeRange = DEFAULT_TIME_RANGE, productPillowId = 'all', userId = '', productType = 'all' }) => {
	// 檢查是否為店長
	const isManager = await UserToRoleService.isStoreManager(userId);
	if (!isManager) {
		throw new Error('權限不符');
	}

	// 取得店長所屬的商品 ID
	const storeManagerProductIds = await ReportSpineModel.fetchStoreManagerProductIds(userId, productType);

	const { labels, data, timeRange: resolvedRange, filters, dateRange } = await buildLineChartDataset({
		timeRange,
		productPillowId,
		userId,
		productType,
		storeManagerProductIds,
		metricFn: record => (Number(record.price) || 0) * (Number(record.quantity) || 1)
	});

	const roundedData = data.map(roundToTwo);
	return {
		labels,
		data: roundedData,
		timeRange: resolvedRange,
		filters,
		summary: {
			totalRevenue: roundToTwo(roundedData.reduce((sum, value) => sum + value, 0)),
			startDate: dateRange.startDate,
			endDate: dateRange.endDate
		}
	};
};

exports.getSalesLineChartData = async ({ timeRange = DEFAULT_TIME_RANGE, productPillowId = 'all', userId = '', productType = 'all' }) => {
	// 檢查是否為店長
	const isManager = await UserToRoleService.isStoreManager(userId);
	if (!isManager) {
		throw new Error('權限不符');
	}

	// 取得店長所屬的商品 ID
	const storeManagerProductIds = await ReportSpineModel.fetchStoreManagerProductIds(userId, productType);

	const { labels, data, timeRange: resolvedRange, filters, dateRange } = await buildLineChartDataset({
		timeRange,
		productPillowId,
		userId,
		productType,
		storeManagerProductIds,
		metricFn: record => Number(record.quantity) || 0
	});

	return {
		labels,
		data,
		timeRange: resolvedRange,
		filters,
		summary: {
			totalSales: data.reduce((sum, value) => sum + value, 0),
			startDate: dateRange.startDate,
			endDate: dateRange.endDate
		}
	};
};

exports.getProductPillowOptions = async (productType = 'all', userId = '') => {
	// 檢查是否為店長
	const isManager = await UserToRoleService.isStoreManager(userId);
	if (!isManager) {
		throw new Error('權限不符');
	}

	// 只返回該店長的商品
	return ReportSpineModel.fetchProductOptions(productType, userId);
};

async function buildLineChartDataset({ timeRange, productPillowId, userId, productType, storeManagerProductIds, metricFn }) {
	const rangeKey = RANGE_CONFIG[timeRange] ? timeRange : DEFAULT_TIME_RANGE;
	const { buckets, startDateISO, endDateISO } = buildBuckets(rangeKey);
	const records = await ReportSpineModel.fetchPurchaseRecords({ 
		startDateISO, 
		endDateISO, 
		userId, 
		productType,
		storeManagerProductIds 
	});
	const data = aggregateMetric(records, buckets, productPillowId, metricFn);

	return {
		labels: buckets.map(bucket => bucket.label),
		data,
		timeRange: rangeKey,
		filters: { productPillowId },
		dateRange: { startDate: startDateISO, endDate: endDateISO }
	};
}

function buildBuckets(rangeKey) {
	const now = new Date();

	switch (rangeKey) {
		case 'week':
			return buildWeeklyBuckets(now, RANGE_CONFIG.week.count);
		case 'month':
			return buildMonthlyBuckets(now, RANGE_CONFIG.month.count);
		case 'quarter':
			return buildQuarterlyBuckets(now, RANGE_CONFIG.quarter.count);
		case 'day':
		default:
			return buildDailyBuckets(now, RANGE_CONFIG.day.count);
	}
}

function buildDailyBuckets(referenceDate, count) {
	const buckets = [];
	const endOfToday = endOfDay(referenceDate);

	for (let i = count - 1; i >= 0; i--) {
		const day = new Date(endOfToday);
		day.setDate(day.getDate() - i);
		const start = startOfDay(day);
		const end = endOfDay(day);
		buckets.push({ start, end, label: formatDateLabel(start) });
	}

	return finalizeBucketRange(buckets);
}

function buildWeeklyBuckets(referenceDate, count) {
	const buckets = [];
	const endOfCurrentWeek = endOfWeek(referenceDate);

	for (let i = count - 1; i >= 0; i--) {
		const anchor = new Date(endOfCurrentWeek);
		anchor.setDate(anchor.getDate() - i * 7);
		const start = startOfWeek(anchor);
		const end = endOfWeek(anchor);
		buckets.push({ start, end, label: formatWeekLabel(start) });
	}

	return finalizeBucketRange(buckets);
}

function buildMonthlyBuckets(referenceDate, count) {
	const buckets = [];
	const currentMonthStart = startOfMonth(referenceDate);

	for (let i = count - 1; i >= 0; i--) {
		const start = shiftMonth(currentMonthStart, -i);
		const end = endOfMonth(start);
		buckets.push({ start, end, label: formatMonthLabel(start) });
	}

	return finalizeBucketRange(buckets);
}

function buildQuarterlyBuckets(referenceDate, count) {
	const buckets = [];
	const currentQuarterStart = startOfQuarter(referenceDate);

	for (let i = count - 1; i >= 0; i--) {
		const start = shiftQuarter(currentQuarterStart, -i);
		const end = endOfQuarter(start);
		buckets.push({ start, end, label: formatQuarterLabel(start) });
	}

	return finalizeBucketRange(buckets);
}

function finalizeBucketRange(buckets) {
	return {
		buckets,
		startDateISO: buckets[0].start.toISOString(),
		endDateISO: buckets[buckets.length - 1].end.toISOString()
	};
}

function aggregateMetric(records, buckets, productPillowId, metricFn) {
	const totals = new Array(buckets.length).fill(0);

	records.forEach(record => {
		if (!record.purchaseDate) {
			return;
		}

		if (productPillowId && productPillowId !== 'all' && record.productPillowId !== productPillowId) {
			return;
		}

		const purchaseDate = new Date(record.purchaseDate);
		if (Number.isNaN(purchaseDate.getTime())) {
			return;
		}

		const bucketIndex = buckets.findIndex(bucket => purchaseDate >= bucket.start && purchaseDate <= bucket.end);
		if (bucketIndex === -1) {
			return;
		}

		totals[bucketIndex] += metricFn(record) || 0;
	});

	return totals;
}

function startOfDay(date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function endOfDay(date) {
	const d = new Date(date);
	d.setHours(23, 59, 59, 999);
	return d;
}

function startOfWeek(date) {
	const d = startOfDay(date);
	const day = d.getDay();
	const diff = day === 0 ? 6 : day - 1; // 以星期一為一週開始
	d.setDate(d.getDate() - diff);
	return d;
}

function endOfWeek(date) {
	const d = startOfWeek(date);
	d.setDate(d.getDate() + 6);
	return endOfDay(d);
}

function startOfMonth(date) {
	return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

function endOfMonth(date) {
	return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function startOfQuarter(date) {
	const month = Math.floor(date.getMonth() / 3) * 3;
	return startOfDay(new Date(date.getFullYear(), month, 1));
}

function endOfQuarter(date) {
	const start = startOfQuarter(date);
	return endOfDay(new Date(start.getFullYear(), start.getMonth() + 3, 0));
}

function shiftMonth(date, offset) {
	return startOfDay(new Date(date.getFullYear(), date.getMonth() + offset, 1));
}

function shiftQuarter(date, offset) {
	return startOfQuarter(new Date(date.getFullYear(), date.getMonth() + offset * 3, 1));
}

function formatDateLabel(date) {
	return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
}

function formatMonthLabel(date) {
	return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}`;
}

function formatQuarterLabel(date) {
	const quarter = Math.floor(date.getMonth() / 3) + 1;
	return `${date.getFullYear()} Q${quarter}`;
}

function formatWeekLabel(date) {
	return `${date.getFullYear()} 第${getWeekNumber(date)}週`;
}

function getWeekNumber(date) {
	const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = tempDate.getUTCDay() || 7;
	tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
	return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
}

function padZero(value) {
	return value.toString().padStart(2, '0');
}

function roundToTwo(value) {
	return Math.round(value * 100) / 100;
}

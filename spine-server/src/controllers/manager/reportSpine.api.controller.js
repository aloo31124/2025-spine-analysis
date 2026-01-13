const reportSpineService = require('../../services/reportSpine.service');
const authService = require('../../services/auth.service');

const ERROR_HEADER = '[reportSpine.api.controller.js]';

exports.getRevenueLineChartData = async (req, res) => {
	console.log(`${ERROR_HEADER} getRevenueLineChartData start`, req.body);
	try {
		const { timeRange = 'day', productPillowId = 'all', productType = 'all' } = req.body || {};
		const payload = authService.verifyJwt(req);
		const result = await reportSpineService.getRevenueLineChartData({ timeRange, productPillowId, userId: payload?.userId, productType });
		res.status(200).json({ result });
	} catch (error) {
		console.error(`${ERROR_HEADER} getRevenueLineChartData error:`, error);
		res.status(500).json({ result: '500', message: error.message });
	}
};

exports.getSalesLineChartData = async (req, res) => {
	console.log(`${ERROR_HEADER} getSalesLineChartData start`, req.body);
	try {
		const { timeRange = 'day', productPillowId = 'all', productType = 'all' } = req.body || {};
		const payload = authService.verifyJwt(req);
		const result = await reportSpineService.getSalesLineChartData({ timeRange, productPillowId, userId: payload?.userId, productType });
		res.status(200).json({ result });
	} catch (error) {
		console.error(`${ERROR_HEADER} getSalesLineChartData error:`, error);
		res.status(500).json({ result: '500', message: error.message });
	}
};

exports.getProductPillowOptions = async (req, res) => {
	console.log(`${ERROR_HEADER} getProductPillowOptions start`, req.query);
	try {
		const { productType = 'all' } = req.query || {};
		const result = await reportSpineService.getProductPillowOptions(productType);
		res.status(200).json({ result });
	} catch (error) {
		console.error(`${ERROR_HEADER} getProductPillowOptions error:`, error);
		res.status(500).json({ result: '500', message: error.message });
	}
};

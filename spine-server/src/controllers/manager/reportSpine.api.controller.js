const reportSpineService = require('../../services/reportSpine.service');

const ERROR_HEADER = '[reportSpine.api.controller.js]';

exports.getRevenueLineChartData = async (req, res) => {
	console.log(`${ERROR_HEADER} getRevenueLineChartData start`, req.body);
	try {
		const { timeRange = 'day', productPillowId = 'all' } = req.body || {};
		const result = await reportSpineService.getRevenueLineChartData({ timeRange, productPillowId });
		res.status(200).json({ result });
	} catch (error) {
		console.error(`${ERROR_HEADER} getRevenueLineChartData error:`, error);
		res.status(500).json({ result: '500', message: error.message });
	}
};

exports.getSalesLineChartData = async (req, res) => {
	console.log(`${ERROR_HEADER} getSalesLineChartData start`, req.body);
	try {
		const { timeRange = 'day', productPillowId = 'all' } = req.body || {};
		const result = await reportSpineService.getSalesLineChartData({ timeRange, productPillowId });
		res.status(200).json({ result });
	} catch (error) {
		console.error(`${ERROR_HEADER} getSalesLineChartData error:`, error);
		res.status(500).json({ result: '500', message: error.message });
	}
};

exports.getProductPillowOptions = async (req, res) => {
	console.log(`${ERROR_HEADER} getProductPillowOptions start`);
	try {
		const result = await reportSpineService.getProductPillowOptions();
		res.status(200).json({ result });
	} catch (error) {
		console.error(`${ERROR_HEADER} getProductPillowOptions error:`, error);
		res.status(500).json({ result: '500', message: error.message });
	}
};



const shopPayLogisticsService = require('../../services/shopPayLogistics.service')

exports.test = async (req, res) => {
    try {
        console.log("[] start");
        const result = await shopPayLogisticsService.createTestData("FAMI");
        res.status(200).json({ result });
    } catch (error) {
        console.error("[] error");
    }
}






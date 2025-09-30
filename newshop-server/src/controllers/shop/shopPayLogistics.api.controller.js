

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


exports.selectLogisticsPage = async (req, res) => {
    try {
        console.log("[selectLogisticsPage] start");
        const result = await shopPayLogisticsService.selectLogisticsPage({
            TempLogisticsID: "0",
            GoodsAmount: 500,
            IsCollection: "N",
            GoodsName: "測試商品",
            SenderName: "王小明",
            SenderZipCode: "100",
            SenderAddress: "台北市中正區XX路1號",
            Remark: "測試訂單",
            ServerReplyURL: "https://yourserver.com/ecpay/logistics/server-reply",
            ClientReplyURL: "https://yourclient.com/ecpay/logistics/client-reply",
            Temperature: "0001",
            Specification: "0001",
            ScheduledPickupTime: "4",
            ReceiverAddress: "台北市大安區OO街2號",
            ReceiverCellPhone: "0912345678",
            ReceiverPhone: "0223456789",
            ReceiverName: "陳小華",
            EnableSelectDeliveryTime: "Y",
            EshopMemberID: "testuser123",
        });
        res.status(200).send(result);
    } catch (error) {
        console.error("[selectLogisticsPage] error");
    }
}




const axios = require("axios");
const { encryptData, decryptData } = require("./ecpayCrypto");

const MerchantID = "2000132"; // 測試環境固定
const API_URL = "https://logistics-stage.ecpay.com.tw/Express/v2/CreateTestData";
const API_URL_SELECT = "https://logistics-stage.ecpay.com.tw/Express/v2/RedirectToLogisticsSelection";


/**
 * 建立一段標測試資料 (B2C)
 * @param {String} logisticsSubType FAMI / UNIMART / UNIMARTFREEZE
 */
async function createTestData(logisticsSubType = "FAMI") {
  try {
    // 產生 timestamp (秒數, GMT+8)
    const timestamp = Math.floor(Date.now() / 1000);

    // Data 需要加密的內容
    const data = {
      MerchantID,
      LogisticsSubType: logisticsSubType,
    };

    // 加密 Data
    const encryptedData = encryptData(data);

    // API 請求 Body
    const payload = {
      PlatformID: "",
      MerchantID,
      RqHeader: {
        Timestamp: timestamp.toString(),
      },
      Data: encryptedData,
    };

    console.log("[Request] payload:", payload);

    // 發送 POST 請求
    const response = await axios.post(API_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const resData = response.data;
    console.log("[Response Raw]:", resData);

    // 解密回傳 Data
    if (resData.Data) {
      const decrypted = decryptData(resData.Data);
      console.log("[Response Decrypted Data]:", decrypted);
      return decrypted;
    }

    return resData;
  } catch (err) {
    console.error("[createTestData] error:", err.message);
    throw err;
  }
}

/**
 * 呼叫物流選擇頁 API
 * @param {Object} orderData - 訂單資料
 */
async function selectLogisticsPage(orderData) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);

    // 加密 Data
    const encryptedData = encryptData(orderData);

    // API 請求 Body
    const payload = {
      PlatformID: "",
      MerchantID,
      RqHeader: {
        Timestamp: timestamp.toString(),
      },
      Data: encryptedData,
    };

    console.log("[Request] payload:", payload);

    // 發送 POST 請求
    const response = await axios.post(API_URL_SELECT, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const resData = response.data;
    console.log("[Response Raw]:", resData);

    // 解密回傳 Data
    if (resData.Data) {
      const decrypted = decryptData(resData.Data);
      console.log("[Response Decrypted Data]:", decrypted);
      return decrypted;
    }

    return resData;
  } catch (err) {
    console.error("[selectLogisticsPage] error:", err.message);
    throw err;
  }
}


module.exports = {
  createTestData,
  selectLogisticsPage
};

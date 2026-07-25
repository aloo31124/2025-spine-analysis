// src/services/ecpayCrypto.js
const crypto = require("crypto");
const querystring = require("querystring");

// 測試金鑰 (測試環境固定)
const HashKey = "5294y06JbISpM5x9";
const HashIV = "v77hoKGq4kWxNNIS";

/**
 * 加密 Data
 * @param {Object} dataObj 要加密的 JSON 物件
 * @returns {String} AES 加密後的字串
 */
function encryptData(dataObj) {
  // 1. JSON 轉字串
  const jsonStr = JSON.stringify(dataObj);

  // 2. URL encode (保持大寫 %XX)
  const urlEncoded = querystring.escape(jsonStr);

  // 3. AES-128-CBC 加密 (PKCS7)
  const cipher = crypto.createCipheriv("aes-128-cbc", HashKey, HashIV);
  cipher.setAutoPadding(true);
  let encrypted = cipher.update(urlEncoded, "utf8", "base64");
  encrypted += cipher.final("base64");

  return encrypted;
}

/**
 * 解密 Data
 * @param {String} encryptedData ECPay 回傳的加密字串
 * @returns {Object} 解密後的 JSON 物件
 */
function decryptData(encryptedData) {
  const decipher = crypto.createDecipheriv("aes-128-cbc", HashKey, HashIV);
  decipher.setAutoPadding(true);
  let decoded = decipher.update(encryptedData, "base64", "utf8");
  decoded += decipher.final("utf8");

  // URL decode
  const jsonStr = querystring.unescape(decoded);

  return JSON.parse(jsonStr);
}

module.exports = {
  encryptData,
  decryptData,
};
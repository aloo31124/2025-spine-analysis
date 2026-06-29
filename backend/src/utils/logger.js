const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

// 取得當前日期並格式化成 YYYY-MM-DD HH:mm:ss.SSS
const getCurrentDate = (type) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    if (type === 'date') {
        return `${year}-${month}-${day}`;
    } else if (type === 'time') {
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
};

// 設定 log 檔案的名稱，根據當前日期
const logFilePath = path.join(__dirname, `../../logs/application_${getCurrentDate('date')}.log`);

// Winston 設定
const logger = createLogger({
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: logFilePath, level: 'info' })
    ]
});

// 取得當前執行的程式檔案與函式名稱
const getCallerInfo = () => {
    const stack = new Error().stack.split('\n').slice(3);  // 取得 堆疊 
    const callerLine = stack[0];
    const match = callerLine.match(/\((.*?):(\d+):(\d+)\)/);
    if (match) {
        const filePath = match[1].split('/').slice(-2).join('/'); // 取得相對檔案路徑
        const lineNumber = match[2];
        return `${filePath}:${lineNumber}`;
    }
    return 'unknown';
};

// 重寫 console.log
const originalLog = console.log;
console.log = (...args) => {
    const callerInfo = getCallerInfo();
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
    logger.info(`[${callerInfo}] LOG: ${message}`);
    originalLog(...args);
};

// 重寫 console.error
const originalError = console.error;
console.error = (...args) => {
    const callerInfo = getCallerInfo();
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
    logger.info(`[${callerInfo}] ERROR: ${message}`);
    originalError(...args);
};

// 匯出日誌功能
module.exports = { logger };

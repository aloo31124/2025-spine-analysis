/**
 * 計算初始高度（頸枕起始高度）
 * 根據年齡與身高決定初始的基準高度
 * 
 * @param {number|string} age - 年齡（歲）
 * @param {number|string} height - 身高（公分）
 * @returns {number|null} 初始高度（公分），若資料不足則返回 null
 */
export const calculateDefaultHeight = (age, height) => {
    // 將輸入轉換為數字
    const ageNum = Number(age);
    const heightNum = Number(height);
    
    // 年齡必須為有效數字
    if (isNaN(ageNum) || ageNum < 0) {
        return null;
    }
    
    // 嬰兒 (0-2歲): 初始高度 3cm（使用低側）
    if (ageNum >= 0 && ageNum <= 2) {
        return 3;
    }
    
    // 嬰兒 (3-4歲): 初始高度 4cm（使用高側）
    if (ageNum >= 3 && ageNum <= 4) {
        return 4;
    }
    
    // 兒童 (5-6歲): 初始高度 5cm（使用低側）
    if (ageNum >= 5 && ageNum <= 6) {
        return 5;
    }
    
    // 兒童 (7-8歲): 初始高度 6cm（使用高側）
    if (ageNum >= 7 && ageNum <= 8) {
        return 6;
    }
    
    // 9歲以上需要身高資料
    if (isNaN(heightNum) || heightNum <= 0) {
        return null;
    }
    
    // 青少年/成人 - 身高 152cm 以下: 初始高度 6cm
    if (heightNum <= 152) {
        return 6;
    }
    
    // 成人 - 身高 153-157cm: 初始高度 6.5cm
    if (heightNum >= 153 && heightNum <= 157) {
        return 6.5;
    }
    
    // 成人 - 身高 158-162cm: 初始高度 7cm
    if (heightNum >= 158 && heightNum <= 162) {
        return 7;
    }
    
    // 成人 - 身高 163-167cm: 初始高度 7.5cm
    if (heightNum >= 163 && heightNum <= 167) {
        return 7.5;
    }
    
    // 成人 - 身高 168-172cm: 初始高度 8cm
    if (heightNum >= 168 && heightNum <= 172) {
        return 8;
    }
    
    // 成人 - 身高 173-177cm: 初始高度 8.5cm
    if (heightNum >= 173 && heightNum <= 177) {
        return 8.5;
    }
    
    // 成人 - 身高 178-182cm: 初始高度 9cm
    if (heightNum >= 178 && heightNum <= 182) {
        return 9;
    }
    
    // 成人 - 身高 183-187cm: 初始高度 9.5cm
    if (heightNum >= 183 && heightNum <= 187) {
        return 9.5;
    }
    
    // 成人 - 身高 188-192cm: 初始高度 10cm
    if (heightNum >= 188 && heightNum <= 192) {
        return 10;
    }
    
    // 成人 - 身高 193-197cm: 初始高度 10.5cm
    if (heightNum >= 193 && heightNum <= 197) {
        return 10.5;
    }
    
    // 成人 - 身高 198cm 以上: 每增加 5cm，高度增加 0.5cm
    // 基準: 193cm = 10.5cm，之後每 5cm 增加 0.5cm
    if (heightNum >= 198) {
        const baseHeight = 10.5;
        const baseHeightCm = 193;
        const extraCm = heightNum - baseHeightCm;
        const extraHeight = Math.floor(extraCm / 5) * 0.5;
        return baseHeight + extraHeight;
    }
    
    return null;
};

/**
 * 格式化初始高度顯示文字
 * 
 * @param {number|null} defaultHeight - 初始高度
 * @returns {string} 格式化後的顯示文字
 */
export const formatDefaultHeight = (defaultHeight) => {
    if (defaultHeight === null || defaultHeight === undefined) {
        return '請輸入年齡及身高';
    }
    return `${defaultHeight} cm`;
};

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
 * 計算標準體重
 * 根據性別與身高計算標準體重
 * 
 * @param {number|string} height - 身高（公分）
 * @param {string} gender - 性別（'男'/'女'）
 * @returns {number|null} 標準體重（公斤），若資料不足則返回 null
 */
export const calculateStandardWeight = (height, gender) => {
    const heightNum = Number(height);
    
    // 身高必須為有效數字
    if (isNaN(heightNum) || heightNum <= 0) {
        return null;
    }
    
    // 性別必須為有效值
    if (!gender || (gender !== '男' && gender !== '女')) {
        return null;
    }
    
    // 男性：(身高cm - 80) × 70%
    if (gender === '男') {
        return (heightNum - 80) * 0.7;
    }
    
    // 女性：(身高cm - 70) × 60%
    if (gender === '女') {
        return (heightNum - 70) * 0.6;
    }
    
    return null;
};

/**
 * 計算體重偏差
 * 計算實際體重與標準體重的差異
 * 
 * @param {number|string} weight - 實際體重（公斤）
 * @param {number} standardWeight - 標準體重（公斤）
 * @returns {number|null} 體重偏差（公斤），正值表示超重，負值表示過輕
 */
export const calculateWeightDeviation = (weight, standardWeight) => {
    const weightNum = Number(weight);
    
    // 體重與標準體重必須為有效數字
    if (isNaN(weightNum) || weightNum <= 0) {
        return null;
    }
    
    if (standardWeight === null || standardWeight === undefined) {
        return null;
    }
    
    // 計算偏差：實際體重 - 標準體重
    return weightNum - standardWeight;
};

/**
 * 根據體重偏差計算高度調整值
 * 依據體重偏差對照表計算需要調整的高度
 * 
 * @param {number} weightDeviation - 體重偏差（公斤）
 * @returns {number} 高度調整值（公分）
 */
export const calculateHeightAdjustment = (weightDeviation) => {
    if (weightDeviation === null || weightDeviation === undefined) {
        return 0;
    }
    
    const absDeviation = Math.abs(weightDeviation);
    
    // 正負 4 kg 以內：不變
    if (absDeviation <= 4) {
        return 0;
    }
    
    // 低於標準體重 5 kg 以上：-0.5
    if (weightDeviation < -4 && absDeviation >= 5) {
        return -0.5;
    }
    
    // 超出標準體重 5-9 kg：+0.5
    if (weightDeviation > 4 && absDeviation >= 5 && absDeviation <= 9) {
        return 0.5;
    }
    
    // 超出標準體重 10-14 kg：+1.0
    if (weightDeviation >= 10 && absDeviation <= 14) {
        return 1.0;
    }
    
    // 超出標準體重 15-18 kg：+1.5
    if (weightDeviation >= 15 && absDeviation <= 18) {
        return 1.5;
    }
    
    // 超出標準體重 19-22 kg：+2.0
    if (weightDeviation >= 19 && absDeviation <= 22) {
        return 2.0;
    }
    
    // 超出標準體重 23 kg 以上：+2.5
    if (weightDeviation >= 23) {
        return 2.5;
    }
    
    return 0;
};

/**
 * 計算調整後的初始高度
 * 先根據年齡身高計算基準高度，再根據體重偏差進行調整
 * 
 * @param {number|string} age - 年齡（歲）
 * @param {number|string} height - 身高（公分）
 * @param {string} gender - 性別（'男'/'女'）
 * @param {number|string} weight - 體重（公斤）
 * @returns {object} 包含基準高度、調整值、最終高度等資訊
 */
export const calculateAdjustedDefaultHeight = (age, height, gender, weight) => {
    // 1. 先計算基準高度（根據年齡身高對照表）
    const baseHeight = calculateDefaultHeight(age, height);
    
    // 如果沒有基準高度，返回 null
    if (baseHeight === null) {
        return {
            baseHeight: null,
            standardWeight: null,
            weightDeviation: null,
            heightAdjustment: 0,
            finalHeight: null
        };
    }
    
    // 2. 計算標準體重
    const standardWeight = calculateStandardWeight(height, gender);
    
    // 3. 計算體重偏差
    const weightDeviation = calculateWeightDeviation(weight, standardWeight);
    
    // 4. 計算高度調整值
    const heightAdjustment = calculateHeightAdjustment(weightDeviation);
    
    // 5. 計算最終高度
    const finalHeight = baseHeight + heightAdjustment;
    
    return {
        baseHeight,              // 基準高度
        standardWeight,          // 標準體重
        weightDeviation,         // 體重偏差
        heightAdjustment,        // 高度調整值
        finalHeight              // 最終高度
    };
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

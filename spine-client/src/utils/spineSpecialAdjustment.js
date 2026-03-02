/**
 * 脊椎曲線特殊調整規則 (機械測量)
 *
 * 根據機械量測之垂直平行距離進行最終微調。
 * 對應文件：四、脊椎曲線特殊調整規則 (墊片與加高)
 */

/**
 * 計算頸椎凹點至後腦勺 (3-6) 的調整方案
 * @param {number|string} measurement - 測量距離（公分）
 * @returns {{ adjustment: string, modelNote: string, level: 'normal'|'warn'|'danger' }|null}
 *
 * 規則：
 * - 1.6 - 2.1 cm → 增加「半張墊片」，型號 X.5
 * - 2.2 cm 以上  → 增加「二個半張墊片」，型號 X.2
 * - 其他          → 正常範圍，無需特殊調整
 */
export const calculateSpine36Adjustment = (measurement) => {
    if (measurement === '' || measurement === null) return null;
    const val = parseFloat(measurement);
    if (isNaN(val)) return null;

    if (val >= 1.6 && val <= 2.1) {
        return {
            adjustment: '增加「半張墊片」',
            modelNote: '若原先已因體重加 0.5 cm（整張），則改為半張。型號改為 X.5',
            level: 'warn'
        };
    } else if (val >= 2.2) {
        return {
            adjustment: '增加「二個半張墊片」',
            modelNote: '若原先已因體重加 0.5 cm（整張），則改為二個半張。型號改為 X.2',
            level: 'danger'
        };
    }

    return { adjustment: '測量值在正常範圍，無需特殊調整', modelNote: '', level: 'normal' };
};

/**
 * 計算頸椎凹點至背部凸點 (3-7) 的調整方案
 * @param {number|string} excess - 超過標準的距離（公分）
 * @returns {{ adjustment: string, modelNote: string, level: 'normal'|'warn' }|null}
 *
 * 規則：
 * - 每超過標準 0.5 cm → 高度額外增加 0.5 cm
 * - 未滿 0.5 cm 或未超過標準 → 無需調整
 */
export const calculateSpine37Adjustment = (excess) => {
    if (excess === '' || excess === null) return null;
    const val = parseFloat(excess);
    if (isNaN(val) || val <= 0) return { adjustment: '未超過標準，無需調整', modelNote: '', level: 'normal' };

    // 每超過標準 0.5 cm，高度額外增加 0.5 cm
    const steps = Math.floor(val / 0.5);
    if (steps === 0) return { adjustment: '超出不足 0.5 cm，無需調整', modelNote: '', level: 'normal' };

    const additionalHeight = steps * 0.5;
    return {
        adjustment: `高度額外增加 ${additionalHeight} cm`,
        modelNote: `超過標準 ${val} cm，共計 ${steps} 個 0.5 cm 單位`,
        level: 'warn'
    };
};

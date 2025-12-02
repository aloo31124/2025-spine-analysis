const CM_PER_SEGMENT = 10;
const PIXELS_PER_SEGMENT = 40;
const CM_PER_PIXEL = CM_PER_SEGMENT / PIXELS_PER_SEGMENT;

const toNumberOrZero = (value) => (Number.isFinite(value) ? value : 0);

const roundToPrecision = (value, precision = 2) => {
    const safeValue = toNumberOrZero(value);
    const factor = 10 ** precision;
    return Math.round(safeValue * factor) / factor;
};

export const SCALE_REFERENCE = {
    cmPerSegment: CM_PER_SEGMENT,
    pxPerSegment: PIXELS_PER_SEGMENT,
    cmPerPx: CM_PER_PIXEL
};

export const convertPxToCm = (pxValue, precision = 2) => {
    const cmValue = toNumberOrZero(pxValue) * CM_PER_PIXEL;
    return roundToPrecision(cmValue, precision);
};

export const formatPxCmText = (pxValue, precision = 2) => {
    const pxText = roundToPrecision(pxValue, precision).toFixed(precision);
    const cmText = convertPxToCm(pxValue, precision).toFixed(precision);
    return `${pxText} px (${cmText} cm)`;
};

export const buildLengthSummary = (pxValue, precision = 2) => ({
    px: roundToPrecision(pxValue, precision),
    cm: convertPxToCm(pxValue, precision)
});

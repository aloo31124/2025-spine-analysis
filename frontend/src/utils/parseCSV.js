import Papa from "papaparse";

/** 解析 CSV 字串為 JSON 陣列 */
export const parseCSVtoJson = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
};

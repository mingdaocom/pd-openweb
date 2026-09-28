/**
 * 过滤子表数据中用于占位的空白行，保留真实记录。
 */
export function filterEmptyChildTableRows(rows = []) {
  try {
    return rows.filter(row => !(row.rowid || '').startsWith('empty'));
  } catch (err) {
    console.error(err);
    return [];
  }
}

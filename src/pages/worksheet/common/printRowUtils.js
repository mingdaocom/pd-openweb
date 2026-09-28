const NON_RECORD_ROW_IDS = new Set(['groupTitle', 'loadGroupMore']);

export function isPrintableRowId(rowId) {
  return Boolean(rowId && !NON_RECORD_ROW_IDS.has(rowId));
}

export function isPrintableRecord(row) {
  return isPrintableRowId(row?.rowid);
}

export function normalizePrintableRows(data) {
  const seenRowIds = new Set();
  const rows = (data || []).flatMap(item => (Array.isArray(item?.rows) ? item.rows : [item]));

  return rows
    .map(row => safeParse(row, 'object'))
    .filter(row => {
      if (!isPrintableRecord(row) || seenRowIds.has(row.rowid)) return false;
      seenRowIds.add(row.rowid);
      return true;
    });
}

import { useEffect, useState } from 'react';
import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';

/**
 * 检查工作表行按钮状态的 hook
 * @param {string} worksheetId - 工作表 ID
 * @param {Array} rowIds - 行 ID 数组
 * @param {Array} btnIds - 按钮 ID 数组
 * @returns {Object} - { buttonsCheckStatus, loading }
 */
export default function useButtonStatusOfRows(worksheetId, rowIds = [], btnIds = []) {
  const [buttonsCheckStatus, setButtonsCheckStatus] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!worksheetId || !rowIds.length || !btnIds.length || _.get(window, 'shareState.shareId')) {
      return;
    }

    setLoading(true);
    worksheetAjax
      .checkWorksheetRowsBtn({ worksheetId, rowIds, btnIds })
      .then(data => {
        const newStatus = {};
        data.forEach(item => {
          item.rowIds.forEach(rowId => {
            newStatus[`${rowId}-${item.btnId}`] = true;
          });
        });
        setButtonsCheckStatus(newStatus);
      })
      .finally(() => setLoading(false));
  }, [worksheetId, rowIds, btnIds]);

  return { buttonsCheckStatus, loading };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import worksheet from 'src/api/worksheet';
import { formatValuesOfOriginConditions } from 'worksheet/common/WorkSheetFilter/util';

export function useRecords({
  appId,
  worksheetId,
  viewId,
  filterId,
  keyWords,
  isGetWorksheet,
  onError = () => {},
  ...rest
} = {}) {
  const cache = useRef({});
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [controls, setControls] = useState([]);
  const [filterControls, setFilterControls] = useState(rest.filterControls);
  const loadRecords = useCallback(async () => {
    setLoading(true);
    let filtersFromFilterId = [];
    if (filterId) {
      if (cache.current[filterId]) {
        filtersFromFilterId = cache.current[filterId];
      } else {
        const filterRes = await worksheet.getWorksheetFilterById({ filterId });
        cache.current[filterId] = formatValuesOfOriginConditions(filterRes.items || []);
        filtersFromFilterId = cache.current[filterId];
      }
    }
    const res = await worksheet.getFilterRows({
      appId,
      worksheetId,
      viewId,
      keyWords,
      filterControls: filtersFromFilterId.concat(filterControls),
      isGetWorksheet,
    });
    if (res.resultCode !== 1) {
      setLoading(false);
      onError(res);
      return;
    }
    if (isGetWorksheet) {
      setControls(res.template.controls);
    }
    setRecords(res.data);
    setLoading(false);
  }, [appId, viewId, worksheetId, keyWords, filterId, rest.filterControls]);
  useEffect(() => {
    loadRecords();
  }, [keyWords, filterControls]);
  return {
    loading,
    records,
    controls,
    setFilterControls,
  };
}

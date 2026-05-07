import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import _, { find, get, isEmpty, isFunction, trim, uniqBy } from 'lodash';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import sheetAjax from 'src/api/worksheet';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getTranslateInfo } from 'src/utils/app';
import { replaceControlsTranslateInfo } from 'src/utils/translate';

export const ERROR_STATUS = {
  NO_PERMISSION: -1,
  INVALID_CONDITION: 1,
  OVER_LENGTH: 52,
};

export const ERROR_MESSAGE = {
  [ERROR_STATUS.NO_PERMISSION]: _l('没有权限'),
  [ERROR_STATUS.INVALID_CONDITION]: _l('没有符合条件的记录'),
  [ERROR_STATUS.OVER_LENGTH]: _l('筛选文本过长'),
};

// 公开表单下接口异化
const worksheetAjax =
  window.isPublicWorksheet && !_.get(window, 'shareState.isPublicWorkflowRecord') ? publicWorksheetAjax : sheetAjax;

function getSearchConfig(control) {
  try {
    const { searchcontrol, searchtype, clicksearch, searchfilters = '[]' } = control.advancedSetting || {};
    let searchControl;

    if (searchcontrol) {
      searchControl = _.find(control.relationControls, { controlId: searchcontrol });
    }

    return {
      searchControl,
      searchType: Number(searchtype),
      clickSearch: clicksearch === '1',
      searchFilters: safeParse(searchfilters, 'array'),
    };
  } catch (err) {
    console.error(err);
    return {};
  }
}

const LIST_MODE_PAGE_SIZE = 1000;

export default function useRecords(props) {
  const {
    getType,
    control,
    worksheetId,
    viewId,
    defaultPageSize,
    recordId,
    isDraft,
    controlId,
    parentWorksheetId,
    appId,
    formData,
    ignoreRowIds,
    filterRowIds = [],
    listMode = false, // chooselisttype === '2' 时为 true，一次性加载 1000 条，滚动加载更多
  } = props;
  const cache = useRef({});
  const nextPageRef = useRef(1); // 列表模式下“下一页”页码，用于 loadMore 追加
  const loadMoreInProgressRef = useRef(false); // 同步锁，防止同一页 loadMore 触发两次
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [worksheetInfo, setWorksheetInfo] = useState({});
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [keyWords, setKeyWords] = useState('');
  const [sortControl, setSortControl] = useState();
  const [pageIndex, setPageIndex] = useState(1);
  const effectiveDefaultPageSize = listMode ? LIST_MODE_PAGE_SIZE : defaultPageSize || 10;
  const [pageSize, setPageSize] = useState(effectiveDefaultPageSize);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState();
  const [quickFilters, setQuickFilters] = useState([]);
  const [ignoreAllFilters, setIgnoreAllFilters] = useState(false); // 忽略所有过滤条件
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  // 关联查询配置
  const searchConfig = useMemo(() => (control ? getSearchConfig(control) : {}), [control]);
  const { searchControl, clickSearch } = searchConfig;
  const filterControls = useMemo(() => {
    if (control && control.advancedSetting && control.advancedSetting.filters) {
      return getFilter({
        control: { ...control, recordId, relationControls: get(worksheetInfo, 'template.controls', []) },
        formData,
        appId,
      });
    }

    return;
  }, [control, formData, worksheetInfo]);
  const load = useCallback(() => {
    if (filterControls === false && !ignoreAllFilters) {
      setError(ERROR_STATUS.INVALID_CONDITION);
      setRecordsLoading(false);
      return;
    }

    if (clickSearch && !keyWords) {
      setRecordsLoading(false);
      return;
    }

    setRecordsLoading(true);
    setRecords([]);
    const args = {
      appId,
      worksheetId,
      viewId,
      searchType: 1,
      pageSize,
      pageIndex,
      status: 1,
      keyWords: trim(keyWords),
      isGetWorksheet: true,
      filterControls: ignoreAllFilters ? [] : filterControls || [],
      getType: getType || (isDraft ? 27 : 7),
      sortControls: sortControl ? [sortControl] : [],
      fastFilters: quickFilters.map(f =>
        _.pick(f, [
          'advancedSetting',
          'controlId',
          'dataType',
          'spliceType',
          'filterType',
          'dateRange',
          'dateRangeType',
          'value',
          'values',
          'minValue',
          'maxValue',
        ]),
      ),
    };
    let getFilterRowsPromise;

    if (!window.isPublicWorksheet) {
      getFilterRowsPromise = sheetAjax.chooseRelationRows;
    } else {
      getFilterRowsPromise = publicWorksheetAjax.getRelationRows;
      args.shareId = window.publicWorksheetShareId;
    }

    if (parentWorksheetId && controlId && _.get(parentWorksheetId, 'length') === 24) {
      args.relationWorksheetId = parentWorksheetId;
      args.rowId = recordId;
      args.controlId = controlId;
      if (ignoreRowIds) {
        args.requestParams = {
          _system_excluderowids: JSON.stringify(ignoreRowIds),
        };
      }

      if (!isEmpty(filterRowIds)) {
        args.requestParams = {
          ...(args.requestParams || {}),
          exclude_rowids: JSON.stringify(filterRowIds),
        };
      }
    }

    if (isFunction(get(cache, 'current.request.abort'))) {
      cache.current.request.abort();
    }

    const request = getFilterRowsPromise(args);
    cache.current.request = request;
    request
      .then(res => {
        if (res.resultCode === 1) {
          let filteredRecords = uniqBy(res.data, 'rowid');
          const needSort =
            keyWords &&
            pageIndex === 1 &&
            get(control, 'advancedSetting.searchcontrol') &&
            searchControl &&
            find(filteredRecords, c => c[searchControl.controlId] === keyWords);

          if (
            needSort &&
            get(control, 'advancedSetting.searchtype') !== '1' &&
            find(filteredRecords, c => c[searchControl.controlId] === keyWords)
          ) {
            filteredRecords = filteredRecords.sort((a, b) => {
              if (a[searchControl.controlId] === keyWords) {
                return -1;
              }

              if (b[searchControl.controlId] === keyWords) {
                return 1;
              }

              return 0;
            });
          }

          if (filteredRecords.length === 0 && pageIndex * pageSize < res.count) {
            setPageIndex(pageIndex + 1);
          }

          if (listMode && pageIndex === 1) {
            nextPageRef.current = 1;
          }

          setRecords(filteredRecords);
          setTotal(res.count);
          setRecordsLoading(false);
        } else {
          setRecordsLoading(false);
          setError(res.resultCode === ERROR_STATUS.OVER_LENGTH ? ERROR_STATUS.OVER_LENGTH : ERROR_STATUS.NO_PERMISSION);
        }
      })
      .catch(err => {
        setError(err.errorCode);
      });
  }, [pageIndex, pageSize, keyWords, filterControls, ignoreAllFilters, sortControl, quickFilters, clickSearch]);
  useEffect(() => {
    load();
  }, [pageIndex, pageSize, keyWords, filterControls, ignoreAllFilters, sortControl, quickFilters, clickSearch]);

  const loadMore = useCallback(() => {
    if (!listMode || records.length >= total) return;
    if (loadMoreInProgressRef.current) return;
    loadMoreInProgressRef.current = true;
    const nextPage = nextPageRef.current + 1;
    const args = {
      appId,
      worksheetId,
      viewId,
      searchType: 1,
      pageSize,
      pageIndex: nextPage,
      status: 1,
      keyWords: trim(keyWords),
      isGetWorksheet: true,
      filterControls: ignoreAllFilters ? [] : filterControls || [],
      getType: getType || (isDraft ? 27 : 7),
      sortControls: sortControl ? [sortControl] : [],
      fastFilters: quickFilters.map(f =>
        _.pick(f, [
          'advancedSetting',
          'controlId',
          'dataType',
          'spliceType',
          'filterType',
          'dateRange',
          'dateRangeType',
          'value',
          'values',
          'minValue',
          'maxValue',
        ]),
      ),
    };

    if (parentWorksheetId && controlId && _.get(parentWorksheetId, 'length') === 24) {
      args.relationWorksheetId = parentWorksheetId;
      args.rowId = recordId;
      args.controlId = controlId;
      if (ignoreRowIds) {
        args.requestParams = { _system_excluderowids: JSON.stringify(ignoreRowIds) };
      }

      if (!isEmpty(filterRowIds)) {
        args.requestParams = {
          ...(args.requestParams || {}),
          exclude_rowids: JSON.stringify(filterRowIds),
        };
      }
    }

    let getFilterRowsPromise;

    if (!window.isPublicWorksheet) {
      getFilterRowsPromise = sheetAjax.chooseRelationRows;
    } else {
      getFilterRowsPromise = publicWorksheetAjax.getRelationRows;
      args.shareId = window.publicWorksheetShareId;
    }

    setLoadMoreLoading(true);
    getFilterRowsPromise(args)
      .then(res => {
        if (res.resultCode === 1) {
          let moreRecords = uniqBy(res.data, 'rowid');
          setRecords(prev => [...prev, ...moreRecords]);
          nextPageRef.current = nextPage;
        }
      })
      .finally(() => {
        setLoadMoreLoading(false);
        loadMoreInProgressRef.current = false;
      });
  }, [
    listMode,
    records.length,
    total,
    appId,
    worksheetId,
    viewId,
    pageSize,
    keyWords,
    filterControls,
    ignoreAllFilters,
    sortControl,
    quickFilters,
    getType,
    isDraft,
    parentWorksheetId,
    controlId,
    recordId,
    ignoreRowIds,
    filterRowIds,
  ]);

  useEffect(() => {
    getWorksheetInfo(worksheetId, parentWorksheetId).then(data => {
      setWorksheetInfo(data);
      setLoading(false);
    });
  }, [worksheetId, parentWorksheetId]);

  const hasMore = listMode && records.length < total;

  return {
    loading,
    worksheetInfo,
    recordsLoading,
    records,
    pageIndex,
    pageSize,
    keyWords,
    error,
    total,
    sortControl,
    searchConfig,
    quickFilters,
    changePageIndex: setPageIndex,
    changePageSize: setPageSize,
    setIgnoreAllFilters,
    setRecords,
    refresh: load,
    listMode,
    loadMore,
    loadMoreLoading,
    hasMore,
    handleUpdateKeyWords: newKeyWords => {
      setRecordsLoading(true);
      setKeyWords(newKeyWords);
      setPageIndex(1);
    },
    handleUpdateSortControl: newSortControl => {
      setSortControl(newSortControl);
      setPageIndex(1);
      setRecords([]);
    },
    handleUpdateQuickFilters: newQuickFilters => {
      setQuickFilters(newQuickFilters);
      setPageIndex(1);
      setRecords([]);
    },
  };
}

export function getWorksheetInfo(worksheetId, parentWorksheetId) {
  return worksheetAjax
    .getWorksheetInfo({
      worksheetId,
      getTemplate: true,
      relationWorksheetId: parentWorksheetId,
    })
    .then(data => {
      window.worksheetControlsCache = {};
      get(data, 'template.controls', []).forEach(c => {
        if (c.type === 29) {
          window.worksheetControlsCache[c.dataSource] = c.relationControls;
        }
      });
      const appId = _.get(window, 'appInfo.id');
      const translateInfo = getTranslateInfo(appId, null, data.worksheetId);
      data.entityName = translateInfo.recordName || data.entityName;
      if (get(data, 'template.controls')) {
        data.template.controls = replaceControlsTranslateInfo(appId, data.worksheetId, data.template.controls);
      }

      return data;
    });
}

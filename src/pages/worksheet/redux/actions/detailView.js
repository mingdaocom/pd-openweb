import worksheetApi from 'src/api/worksheet';
import { formatQuickFilter, getFilledRequestParams } from 'worksheet/util';
import _ from 'lodash';

let detailRowsRequest = null;

export const fetchRows = (pageIndex, keyWords) => {
  return (dispatch, getState) => {
    const { base, filters, detailView, quickFilter, navGroupFilters } = getState().sheet;
    const { appId, viewId, worksheetId } = base;
    let { detailViewRows, detailViewLoading } = detailView;

    if (detailRowsRequest && detailRowsRequest.abort) {
      detailRowsRequest.abort();
    }

    dispatch({ type: 'CHANGE_DETAIL_VIEW_PAGE_INDEX', pageIndex });
    dispatch({ type: 'CHANGE_DETAIL_VIEW_LOADING', loading: true });
    dispatch({ type: 'CHANGE_DETAIL_VIEW_KEYWORDS', keyWords });

    const args = {
      appId,
      viewId,
      worksheetId,
      pageIndex,
      pageSize: 50,
      status: 1,
      ...{ ...filters, keyWords: keyWords || filters.keyWords },
      fastFilters: formatQuickFilter(quickFilter),
      navGroupFilters,
    };
    detailRowsRequest = worksheetApi.getFilterRows(getFilledRequestParams(args));
    detailRowsRequest.then(res => {
      dispatch({
        type: 'CHANGE_DETAIL_VIEW_ROWS',
        list: pageIndex > 1 ? detailViewRows.concat(res.data) : res.data,
        resultCode: res.resultCode,
      });
      dispatch({ type: 'CHANGE_DETAIL_VIEW_ROWS_COUNT', count: res.count });
      dispatch({ type: 'CHANGE_DETAIL_VIEW_NO_MORE_ROWS', noMore: res.data.length < 50 });
      dispatch({ type: 'CHANGE_DETAIL_VIEW_LOADING', loading: false });
    });
  };
};

export const refresh = () => {
  return (dispatch, getState) => {
    const { detailView } = getState().sheet;
    let { detailKeyWords } = detailView;
    dispatch(fetchRows(1, detailKeyWords));
  };
};

export const clearData = () => {
  return (dispatch, getState) => {
    dispatch({ type: 'CHANGE_DETAIL_VIEW_ROWS', list: [] });
    dispatch({ type: 'CHANGE_DETAIL_VIEW_KEYWORDS', keyWords: '' });
  };
};

//add | update
export const updateRow = data => {
  return (dispatch, getState) => {
    const { detailView } = getState().sheet;
    let { detailViewRows } = detailView;
    const row = detailViewRows.find(o => o.rowid === data.rowid);
    if (!row) {
      dispatch({
        type: 'CHANGE_DETAIL_VIEW_ROWS',
        list: [data].concat(detailViewRows),
      });
      dispatch({ type: 'CHANGE_DETAIL_VIEW_ROWS_COUNT', count: detailView.detailViewRowsCount + 1 });
    } else {
      dispatch({
        type: 'CHANGE_DETAIL_VIEW_ROWS',
        list: detailViewRows.map(o => {
          if (o.rowid === data.rowid) {
            return { ...data, ..._.pick(o, ['allowedit', 'allowdelete']) }; //接口返回'allowedit', 'allowdelete' 不对，沿用更改前
          } else {
            return o;
          }
        }),
      });
    }
  };
};

//删除
export const deleteRow = id => {
  return (dispatch, getState) => {
    const { detailView } = getState().sheet;
    let { detailViewRows } = detailView;
    const newList = detailViewRows.filter(o => o.rowid !== id);
    dispatch({
      type: 'CHANGE_DETAIL_VIEW_ROWS',
      list: newList,
    });
    dispatch({ type: 'CHANGE_DETAIL_VIEW_ROWS_COUNT', count: detailView.detailViewRowsCount - 1 });
  };
};

export function detailViewRows(state = [], action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_DETAIL_VIEW_ROWS':
      return action.list;
    default:
      return state;
  }
}

export function detailViewRowsCount(state = 0, action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_DETAIL_VIEW_ROWS_COUNT':
      return action.count;
    default:
      return state;
  }
}

export function noMoreRows(state = false, action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_DETAIL_VIEW_NO_MORE_ROWS':
      return action.noMore;
    default:
      return state;
  }
}

export function detailViewLoading(state = false, action) {
  switch (action.type) {
    case 'CHANGE_DETAIL_VIEW_LOADING':
      return action.loading;
    default:
      return state;
  }
}

export function detailPageIndex(state = 1, action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_DETAIL_VIEW_PAGE_INDEX':
      return action.pageIndex;
    default:
      return state;
  }
}

export function detailKeyWords(state = '', action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_DETAIL_VIEW_KEYWORDS':
      return action.keyWords || '';
    default:
      return state;
  }
}

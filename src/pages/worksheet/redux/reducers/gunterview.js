
export function groupingScroll(state = null, action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_GROUPING_SCROLL':
      return action.data;
    default:
      return state;
  }
}

export function chartScroll(state = null, action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_CHART_SCROLL':
      return action.data;
    default:
      return state;
  }
}


export function loading(state = true, action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_LOADINNG':
      return action.data;
    default:
      return state;
  }
}

export function grouping(state = [], action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_GROUPING':
      return action.data;
    default:
      return state;
  }
}

export function groupingVisible(state = (localStorage.getItem('gunterGroupingVisible') === 'false' ? false : true), action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_GROUPING_VISIBLE':
      return action.data;
    default:
      return state;
  }
}

export function periodType(state = null, action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_PERIOD_TYPE':
      return action.data;
    default:
      return state;
  }
}

export function periodList(state = [], action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_PERIOD_LIST':
      return action.data;
    default:
      return state;
  }
}

export function periodParentList(state = [], action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_PERIOD_PARENT_LIST':
      return action.data;
    default:
      return state;
  }
}

export function isRefresh(state = false, action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_IS_REFRESH':
      return action.data;
    default:
      return state;
  }
}

export function viewConfig(state = {}, action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_VIEW_CONFIG':
      return action.data;
    default:
      return state;
  }
}

export function editIndex(state = null, action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_EDIT_INDEX':
      return action.data;
    default:
      return state;
  }
}

export function withoutArrangementVisible(state = false, action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_WITHOUT_ARRANGEMENT_VISIBLE':
      return action.data;
    default:
      return state;
  }
}

export function searchRecordId(state = null, action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_SEARCH_RECORD_ID':
      return action.data;
    default:
      return state;
  }
}

export function zoom(state = null, action) {
  switch (action.type) {
    case 'CHANGE_GUNTER_ZOOM':
      return action.data;
    default:
      return state;
  }
}

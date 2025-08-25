export function loading(state = true, action) {
  switch (action.type) {
    case 'CHANGE_RESOURCE_LOADING':
      return action.data;
    default:
      return state;
  }
}

export function keywords(state = '', action) {
  switch (action.type) {
    case 'CHANGE_RESOURCE_KEYWORDS':
      return action.data;
    default:
      return state;
  }
}

export function resourceRelationControls(state = [], action) {
  switch (action.type) {
    case 'CHANGE_RESOURCE_RESOURCE_RELATION_CONTROLS':
      return action.data;
    default:
      return state;
  }
}

export function resourceData(state = [], action) {
  switch (action.type) {
    case 'CHANGE_RESOURCE_RESOURCE_DATA':
      return action.data;
    default:
      return state;
  }
}

export function resourceDataByKey(state = [], action) {
  switch (action.type) {
    case 'CHANGE_RESOURCE_RESOURCE_DATA_BY_KEY':
      return action.data;
    default:
      return state;
  }
}

export function timeList(state = [], action) {
  switch (action.type) {
    case 'CHANGE_RESOURCE_TIME_LIST':
      return action.data;
    default:
      return state;
  }
}
export function gridTimes(state = [], action) {
  switch (action.type) {
    case 'CHANGE_RESOURCE_TIME_LIST_A':
      return action.data;
    default:
      return state;
  }
}

export function currentTime(state = null, action) {
  switch (action.type) {
    case 'CHANGE_RESOURCE_CURRENT_TIME':
      return action.data;
    default:
      return state;
  }
}

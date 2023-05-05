import _ from 'lodash';
export function loading(state = true, action) {
  switch (action.type) {
    case 'WORKSHEET_UPDATE_LOADING':
      return action.loading;
    case 'WORKSHEET_INIT':
    case 'WORKSHEET_INIT_FAIL':
      return false;
    case 'WORKSHEET_FETCH_START':
      return true;
    default:
      return state;
  }
}

export function error(state = false, action) {
  switch (action.type) {
    case 'WORKSHEET_INIT_FAIL':
      return true;
    case 'WORKSHEET_FETCH_START':
      return false;
    default:
      return state;
  }
}

export function worksheetInfo(state = {}, action) {
  let newState;
  switch (action.type) {
    case 'WORKSHEET_INIT':
      return action.value;
    case 'WORKSHEET_UPDATE_WORKSHEETINFO':
      return { ...state, ...action.info };
    case 'WORKSHEET_UPDATE_SOME_CONTROLS':
      try {
        newState = {
          ...state,
          template: {
            ...state.template,
            controls: state.template.controls.map(c => {
              const matchedControl = _.find(action.controls, { controlId: c.controlId });
              return matchedControl ? { ...matchedControl, value: c.value } : c;
            }),
          },
        };
        return newState;
      } catch (err) {
        console.error(err);
        return state;
      }
    default:
      return state;
  }
}

export function sheetSwitchPermit(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_PERMISSION_INIT':
      return action.value;
    case 'WORKSHEET_FETCH_START':
      return [];
    default:
      return state;
  }
}
export function sheetSearchConfig(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_SEARCH_CONFIG_INIT':
      return action.value;
    case 'WORKSHEET_FETCH_START':
      return [];
    default:
      return state;
  }
}

export function views(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_INIT':
      return action.value.views || state;
    case 'WORKSHEET_UPDATE_VIEWS':
      return action.views;
    case 'WORKSHEET_UPDATE_VIEW':
      return state.map(v => (v.viewId === action.view.viewId ? action.view : v));
    case 'WORKSHEET_FETCH_START':
      return [];
    default:
      return state;
  }
}

export function buttons(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_UPDATE_BUTTONS':
      return action.buttons;
    case 'WORKSHEET_FETCH_START':
      return [];
    default:
      return state;
  }
}

export function sheetButtons(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_UPDATE_SHEETBUTTONS':
      return action.buttons;
    case 'WORKSHEET_FETCH_START':
      return [];
    default:
      return state;
  }
}

const initialFiltersState = {
  searchType: 1,
  keyWords: '',
  filterControls: [],
};

export function filters(state = initialFiltersState, action) {
  switch (action.type) {
    case 'WORKSHEET_UPDATE_FILTERS':
      return { ...state, ...action.filters };
    case 'WORKSHEET_INIT':
      return initialFiltersState;
    case 'WORKSHEET_UPDATE_BASE':
      return { ...state, keyWords: '' };
    default:
      return state;
  }
}

export function quickFilter(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_UPDATE_QUICK_FILTER':
      return [...action.filter];
    case 'WORKSHEET_RESET_QUICK_FILTER':
    case 'WORKSHEET_UPDATE_BASE':
    case 'WORKSHEET_INIT':
      return [];
    default:
      return state;
  }
}

export function navGroupFilters(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_UPDATE_GROUP_FILTER':
      return action.navGroupFilters || [];
    default:
      return state;
  }
}

export function navGroupCounts(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_NAVGROUP_COUNT':
      return action.data || [];
    default:
      return state;
  }
}

export function controls(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_INIT':
      const { value = {} } = action;
      const { template = {} } = value;
      const { controls = [] } = template;
      return controls;
    case 'WORKSHEET_UPDATE_CONTROLS':
      return action.controls;
    case 'WORKSHEET_UPDATE_SOME_CONTROLS':
      return state.map(c => _.find(action.controls, { controlId: c.controlId }) || c);
    case 'WORKSHEET_UPDATE_CONTROL':
      return state.map(c => (c.controlId === action.control.controlId ? action.control : c));
    default:
      return state;
  }
}

export const draftDataCount = (state = 0, action) => {
  switch (action.type) {
    case 'UPDATE_DRAFT_DATA_COUNT':
      return action.data;
    default:
      return state;
  }
};

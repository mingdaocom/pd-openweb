import update from 'immutability-helper';
import worksheetAjax from 'src/api/worksheet';
import {
  formatOriginFilterGroupValue,
  getDefaultCondition,
  checkConditionAvailable,
  formatConditionForSave,
} from './util';
import { FILTER_TYPE, FILTER_RELATION_TYPE } from './enum';
import _ from 'lodash';

export const initialState = {
  filters: [],
  isGroupFilter: false,
  loading: true,
  needSave: false,
};

export function formatForSave(filter, options = {}) {
  let items;
  if (filter.isGroup) {
    items = update(filter.conditionsGroups || [], {
      $apply: conditionsGroups =>
        conditionsGroups
          .map(conditionsGroup => ({
            spliceType: conditionsGroup.spliceType,
            isGroup: true,
            groupFilters: conditionsGroup.conditions
              .filter(condition => (options.noCheck ? true : checkConditionAvailable(condition)))
              .map(condition => ({
                ...formatConditionForSave(condition, conditionsGroup.conditionSpliceType, options),
              })),
          }))
          .filter(conditionsGroup => options.noCheck || !_.isEmpty(conditionsGroup.groupFilters)),
    });
  } else {
    const conditions = _.get(filter, 'conditionsGroups.0.conditions');
    if (!_.isEmpty(conditions)) {
      items = conditions
        .filter(condition => (options.noCheck ? true : checkConditionAvailable(condition)))
        .map(condition => formatConditionForSave(condition, filter.conditionsGroups[0].conditionSpliceType, options));
    } else {
      items = [];
    }
  }
  return items;
}

class Actions {
  constructor(dispatch) {
    this.dispatch = dispatch;
  }
  init(value) {
    this.dispatch({
      type: 'INIT',
      value,
    });
  }

  setActiveFilter = filter => {
    this.dispatch({
      type: 'UPDATE',
      value: {
        activeFilter: filter,
      },
    });
  };

  loadFilters = (worksheetId, cb = () => {}) => {
    worksheetAjax.getWorksheetFilters({ worksheetId }).then(data => {
      let filters = data.map(formatOriginFilterGroupValue);
      if (md.global.Account.isPortal) {
        filters = filters.filter(o => o.type !== 2); // 外部门户 排除公共筛选
      }
      cb(filters);
      this.dispatch({
        type: 'UPDATE',
        value: {
          filters,
          loading: false,
        },
      });
    });
  };

  addFilter = ({ defaultCondition } = {}) => {
    const newFilter = {
      id: `new-${new Date().getTime().toString(16)}-${Math.random().toString(16).slice(2)}`,
      isGroup: true,
      name: _l('自定义筛选'),
      type: 1,
      conditionsGroups: [
        {
          spliceType: FILTER_RELATION_TYPE.AND,
          conditionSpliceType: FILTER_RELATION_TYPE.AND,
          conditions: defaultCondition ? [defaultCondition] : [],
        },
      ],
      conditions: [],
    };
    this.dispatch({
      type: 'UPDATE',
      value: {
        editingFilter: newFilter,
      },
    });
  };

  editFilter = filter => {
    this.dispatch({
      type: 'UPDATE',
      value: {
        editingFilter: filter,
        needSave: false,
      },
    });
  };

  changeEditingFilter = (value = {}) => {
    this.dispatch({
      type: 'CHANGE_EDITING_FILTER',
      value,
    });
  };

  addCondition = (control, groupIndex = 0, from) => {
    const condition = getDefaultCondition(control, from);
    this.dispatch({
      type: 'ADD_CONDITION',
      condition: condition,
      groupIndex,
    });
  };

  updateCondition = (value, groupIndex = 0, conditionIndex) => {
    this.dispatch({
      type: 'UPDATE_CONDITION',
      conditionIndex,
      groupIndex,
      value,
    });
  };

  deleteCondition = (conditionIndex, groupIndex = 0) => {
    this.dispatch({
      type: 'DELETE_CONDITION',
      conditionIndex,
      groupIndex,
    });
  };

  deleteConditionsGroup = (groupIndex = 0) => {
    this.dispatch({
      type: 'DELETE_CONDITIONS_GROUP',
      groupIndex,
    });
  };

  addGroup = spliceType => {
    this.dispatch({
      type: 'ADD_GROUP',
      group: {
        spliceType: spliceType || FILTER_RELATION_TYPE.AND,
        conditionSpliceType: FILTER_RELATION_TYPE.AND,
        conditions: [],
      },
    });
  };

  deleteGroup = groupIndex => {
    this.dispatch({
      type: 'DELETE_GROUP',
      groupIndex,
    });
  };

  updateConditionsGroup = (value = {}, groupIndex = 0) => {
    this.dispatch({
      type: 'UPDATE_CONDITIONS_GROUP',
      groupIndex,
      value,
    });
  };

  copyFilter = ({ appId, worksheetId, filter, isCharge } = {}) => {
    const newFilter = {
      ...filter,
      id: undefined,
      type: isCharge && filter.type === FILTER_TYPE.PUBLIC ? FILTER_TYPE.PUBLIC : FILTER_TYPE.PERSONAL,
      name: _l('%0-复制', filter.name),
    };
    this.saveFilter({
      appId,
      worksheetId,
      filter: newFilter,
    });
  };

  toggleFilterType = ({ appId, worksheetId, filter } = {}) => {
    const newFilter = {
      ...filter,
      type: filter.type === FILTER_TYPE.PUBLIC ? FILTER_TYPE.PERSONAL : FILTER_TYPE.PUBLIC,
    };
    this.saveFilter({
      appId,
      worksheetId,
      filter: newFilter,
    });
  };

  saveFilter = ({ appId, worksheetId, filter }, cb = () => {}) => {
    const isNew = !filter.id || filter.id.startsWith('new');
    const items = formatForSave(filter);
    worksheetAjax
      .saveWorksheetFilter({
        appId,
        filterId: isNew ? undefined : filter.id,
        name: filter.name,
        type: filter.type,
        worksheetId,
        items: items,
      })
      .then(data => {
        if (isNew) {
          this.dispatch({
            type: 'ADD_FILTER',
            filter: formatOriginFilterGroupValue(data),
          });
        } else {
          this.dispatch({
            type: 'UPDATE_FILTER',
            filter: formatOriginFilterGroupValue(data),
          });
        }
        cb(formatOriginFilterGroupValue(data));
        this.dispatch({
          type: 'UPDATE',
          value: {
            editingFilter: undefined,
            needSave: false,
          },
        });
        alert(_l('保存成功！'));
      });
  };

  deleteFilter = ({ appId, filter }, cb = () => {}) => {
    worksheetAjax
      .deleteWorksheetFilter({
        appId,
        filterId: filter.id,
      })
      .then(data => {
        if (data) {
          this.dispatch({
            type: 'DELETE_FILTER',
            filterId: filter.id,
          });
          this.dispatch({
            type: 'UPDATE',
            value: {
              editingFilter: undefined,
              needSave: false,
            },
          });
        } else {
          alert(_l('删除失败'), 3);
        }
      });
  };

  sortFilters = (appId, worksheetId, sortedIds) => {
    worksheetAjax.sortWorksheetFilters({
      appId,
      worksheetId,
      filterIds: sortedIds,
    });
    this.dispatch({
      type: 'SORT_FILTERS',
      ids: sortedIds,
    });
  };

  reset = () => {
    this.dispatch({
      type: 'RESET',
    });
  };
}

export function createActions(dispatch) {
  return new Actions(dispatch);
}

export function createReducer(state = {}, action) {
  function updateWithLastAction(oldState, updates) {
    if (_.isEmpty(updates)) return oldState;
    return update(oldState, { ...updates, lastAction: { $set: action.type + Date.now() } });
  }

  switch (action.type) {
    case 'INIT':
    case 'UPDATE':
      return updateWithLastAction(state, {
        $apply: oldState => ({ ...oldState, ...(action.value || {}) }),
      });
    case 'ADD_FILTER':
      return updateWithLastAction(state, {
        filters: { $push: [action.filter] },
      });
    case 'UPDATE_FILTER':
      return updateWithLastAction(state, {
        filters: {
          $apply: oldFilters => oldFilters.map(filter => (filter.id === action.filter.id ? action.filter : filter)),
        },
      });
    case 'DELETE_FILTER':
      return updateWithLastAction(state, {
        filters: {
          $apply: oldFilters => oldFilters.filter(filter => filter.id !== action.filterId),
        },
      });
    case 'CHANGE_EDITING_FILTER':
      return updateWithLastAction(state, {
        needSave: { $set: !_.get(action, 'value.name') },
        nameIsUpdated: { $set: !!_.get(action, 'value.name') },
        editingFilterVersion: { $set: Math.random() },
        editingFilter: { $merge: action.value },
      });
    case 'ADD_CONDITION':
      return updateWithLastAction(state, {
        needSave: { $set: true },
        editingFilterVersion: { $set: Math.random() },
        editingFilter: { conditionsGroups: { [action.groupIndex]: { conditions: { $push: [action.condition] } } } },
      });
    case 'UPDATE_CONDITION':
      return updateWithLastAction(state, {
        needSave: { $set: true },
        editingFilterVersion: { $set: Math.random() },
        editingFilter: {
          conditionsGroups: {
            [action.groupIndex]: {
              conditions: {
                [action.conditionIndex]: {
                  $apply: condition => updateWithLastAction(condition, { $merge: action.value }),
                },
              },
            },
          },
        },
      });
    case 'UPDATE_CONDITIONS_GROUP':
      return updateWithLastAction(state, {
        needSave: { $set: true },
        editingFilterVersion: { $set: Math.random() },
        editingFilter: {
          conditionsGroups:
            action.groupIndex === '*'
              ? {
                  $apply: conditionsGroups =>
                    conditionsGroups.map(conditionsGroup => ({
                      ...conditionsGroup,
                      ...(action.value || {}),
                    })),
                }
              : {
                  [action.groupIndex]: {
                    $apply: conditionsGroup => updateWithLastAction(conditionsGroup, { $merge: action.value }),
                  },
                },
        },
      });
    case 'DELETE_CONDITION':
      return updateWithLastAction(state, {
        needSave: { $set: true },
        editingFilterVersion: { $set: Math.random() },
        editingFilter: {
          conditionsGroups: { [action.groupIndex]: { conditions: { $splice: [[action.conditionIndex, 1]] } } },
        },
      });
    case 'DELETE_CONDITIONS_GROUP':
      return updateWithLastAction(state, {
        needSave: { $set: true },
        editingFilterVersion: { $set: Math.random() },
        editingFilter: {
          conditionsGroups: { $splice: [[action.groupIndex, 1]] },
        },
      });
    case 'UPDATE_FILTERS':
      return updateWithLastAction(state, {
        filters: { $set: action.value },
      });
    case 'UPDATE_LOADING':
      return updateWithLastAction(state, {
        loading: { $set: action.value },
      });
    case 'ADD_GROUP':
      return updateWithLastAction(state, {
        needSave: { $set: true },
        editingFilterVersion: { $set: Math.random() },
        editingFilter: { isGroup: { $set: true }, conditionsGroups: { $push: [action.group] } },
      });
    case 'DELETE_GROUP':
      return updateWithLastAction(state, {
        needSave: { $set: true },
        editingFilterVersion: { $set: Math.random() },
        editingFilter: { conditionsGroups: { $splice: [[action.groupIndex, 1]] } },
      });
    case 'SORT_FILTERS':
      return updateWithLastAction(state, {
        filters: {
          $apply: oldFilters => action.ids.map(id => _.find(oldFilters, { id })).filter(_.identity),
        },
      });
    case 'RESET':
      return {};
    default:
      return state;
  }
}

import update from 'immutability-helper';
import { get, head, isArray } from 'lodash';
import findIndex from 'lodash/findIndex';

export const getIndex = (state, data) => {
  const { key, rowId } = data;
  const keyIndex = _.findIndex(state, item => item.key === key);
  if (keyIndex < 0) return null;
  const rows = _.get(state, [keyIndex, 'rows']);
  try {
    const rowIndex = _.findIndex(rows, row => JSON.parse(row).rowid === rowId);
    if (rowIndex < 0) return null;
    return [keyIndex, rowIndex];
  } catch (error) {
    return null;
  }
};
// 删除记录
const delRecord = (state, data) => {
  const indexList = getIndex(state, data);
  if (!indexList) return state;
  const [keyIndex, rowIndex] = indexList;
  return update(state, { [keyIndex]: { rows: { $splice: [[rowIndex, 1]] } } });
};

const sortBoardRecord = (state, data) => {
  const { targetKey, rowId, key, value } = data;
  const indexList = getIndex(state, data);
  if (!indexList) return state;
  const [keyIndex, rowIndex] = indexList;
  const targetIndex = findIndex(state, item => item.key === targetKey);
  const originData = JSON.parse(get(state, [keyIndex, 'rows', rowIndex]));
  // 多选单独处理 防止重复
  if (get(head(state), 'type') === 10) {
    const targetBoard = state.find(item => item.key === targetKey);
    const ids = (_.get(targetBoard, 'rows') || []).map(item => _.get(JSON.parse(item), 'rowid'));
    if (ids.includes(rowId)) {
      return update(state, {
        [keyIndex]: { rows: { $splice: [[rowIndex, 1]] } },
      });
    }
  }
  return update(state, {
    [keyIndex]: { rows: { $splice: [[rowIndex, 1]] } },
    [targetIndex]: { rows: { $unshift: [JSON.stringify({ ...originData, [key]: value })] } },
  });
};

const getKeyAndName = data => {
  const { info, target } = data;
  const { type } = info;
  const defaultPara = { targetKey: '-1' };
  if (!target) return defaultPara;

  // 等级
  if (type === 28) {
    return target ? { targetKey: target } : defaultPara;
  }

  const dealFn = parseData => {
    const firstItem = head(parseData);
    if (type === 26) {
      return { name: JSON.stringify(firstItem), targetKey: _.get(firstItem, 'accountId') };
    }
    if (type === 29) {
      return { name: firstItem.name, targetKey: _.get(firstItem, 'sid') };
    }
    if ([9, 11].includes(type)) {
      return { targetKey: firstItem };
    }
  };

  if ([9, 11, 26, 29].includes(type)) {
    try {
      const parseData = JSON.parse(target);
      if (Array.isArray(parseData)) {
        if (parseData.length < 1) return defaultPara;
        return dealFn(parseData);
      }
      return defaultPara;
    } catch (error) {
      return defaultPara;
    }
  }
  return defaultPara;
};

// 更新记录
const updateRecord = (state, data) => {
  const indexList = getIndex(state, data);
  if (!indexList) return state;
  const [keyIndex, rowIndex] = indexList;
  if (data.target !== undefined) {
    const { name, targetKey } = getKeyAndName(data);
    const targetIndex = _.findIndex(state, item => item.key === targetKey);
    if (targetIndex < 0) {
      // 当使用关联表作为看板分组 且清空对应字段关联表时
      if (targetKey === '-1') {
        return update(state, {
          [keyIndex]: { rows: { $splice: [[rowIndex, 1]] } },
          $unshift: [{ key: '-1', rows: [JSON.stringify(data.item)], totalNum: 1 }],
        });
      }
      if (targetKey) {
        const currentItem = JSON.stringify(data.item);
        let nextBoard = {
          key: targetKey,
          rows: [currentItem],
          totalNum: 1,
        };
        if (name) nextBoard = { ...nextBoard, name };
        if (_.get(data, ['info', 'type'])) nextBoard = { ...nextBoard, type: data.info.type };
        return update(state, {
          [keyIndex]: { rows: { $splice: [[rowIndex, 1]] }, totalNum: { $apply: item => item - 1 } },
          $push: [nextBoard],
        });
      }
      return state;
    }

    return update(state, {
      [keyIndex]: { rows: { $splice: [[rowIndex, 1]] } },
      [targetIndex]: { rows: { $unshift: [JSON.stringify(data.item)] } },
    });
  }
  return update(state, { [keyIndex]: { rows: { $splice: [[rowIndex, 1, JSON.stringify(data.item)]] } } });
};

const addRecord = (state, data) => {
  const { item, key } = data;
  const keyIndex = _.findIndex(state, item => item.key === key);
  if (keyIndex < 0) return state;
  return update(state, { [keyIndex]: { rows: { $unshift: [JSON.stringify(item)] } } });
};
const updateTitleData = (state, obj) => {
  const { key, index, data } = obj;
  const keyIndex = _.findIndex(state, item => item.key === key);
  // 只更新编辑的标题数据
  return update(state, {
    [keyIndex]: {
      rows: {
        [index]: {
          $apply: str => {
            const originData = JSON.parse(str);
            return JSON.stringify({ ...originData, ...data });
          },
        },
      },
    },
  });
};

function updateMultiSelectBoard(boardData, data) {
  const { rowId, item, prevValue, currentValue } = data;
  const prevKeys = JSON.parse(prevValue || '[]');
  const currKeys = JSON.parse(currentValue || '[]');

  /**
   * 获取增加记录和移除记录的看板 并分别更新
   * 若取消所有勾选则将记录移动至未分类
   * 若记录之前没有任何勾选项 则从未分类中移除
   */
  const addRecordKeys = currKeys.length > 0 ? currKeys.filter(key => !prevKeys.includes(key)) : ['-1'];
  const removeRecordKeys = prevKeys.length > 0 ? prevKeys.filter(key => !currKeys.includes(key)) : ['-1'];
  if (addRecordKeys.length) {
    addRecordKeys.forEach(key => {
      const index = boardData.findIndex(item => item.key === key);
      boardData = update(boardData, {
        [index]: { totalNum: { $apply: item => item + 1 }, rows: { $push: [JSON.stringify(item)] } },
      });
    });
  }
  if (removeRecordKeys.length) {
    removeRecordKeys.forEach(key => {
      const index = boardData.findIndex(item => item.key === key);
      boardData = update(boardData, {
        [index]: {
          totalNum: { $apply: item => item - 1 },
          rows: {
            $apply: list => {
              const ids = list.map(item => _.get(JSON.parse(item), 'rowid'));
              const rowIndex = ids.findIndex(id => id === rowId);
              return update(list, { $splice: [[rowIndex, 1]] });
            },
          },
        },
      });
    });
  }
  // 更新当前存在的记录
  currKeys.forEach(key => {
    const index = boardData.findIndex(item => item.key === key);
    boardData = update(boardData, {
      [index]: {
        rows: {
          $apply: list => {
            const ids = list.map(item => _.get(JSON.parse(item), 'rowid'));
            const rowIndex = ids.findIndex(id => id === rowId);
            return update(list, { $splice: [[rowIndex, 1, JSON.stringify(item)]] });
          },
        },
      },
    });
  });

  return boardData;
}

const INIT_STATE = {
  boardData: [],
  loading: false,
  boardViewState: { hasMoreData: true, kanbanIndex: 1 },
};
export default function boardView(state = INIT_STATE, action) {
  const { type, data } = action;
  const { boardData, boardViewState, boardViewRecordCount } = state;
  switch (type) {
    case 'CHANGE_BOARD_VIEW_DATA':
    case 'UPDATE_BOARD_VIEW_DATA':
      return { ...state, boardData: data };
    case 'ADD_BOARD_VIEW_RECORD':
      return { ...state, boardData: addRecord(boardData, data) };
    case 'DEL_BOARD_VIEW_RECORD_COUNT':
      return { ...state, boardData: delRecord(boardData, data) };
    case 'UPDATE_BOARD_VIEW_RECORD':
      return { ...state, boardData: updateRecord(boardData, data) };
    case 'SORT_BOARD_VIEW_RECORD':
      return { ...state, boardData: sortBoardRecord(boardData, data) };
    case 'UPDATE_BOARD_TITLE_DATA':
      return { ...state, boardData: updateTitleData(boardData, data) };
    case 'CHANGE_BOARD_VIEW_LOADING':
      return { ...state, boardViewLoading: action.loading };
    case 'CHANGE_BOARD_VIEW_STATE':
      return { ...state, boardViewState: update(boardViewState, { $apply: item => ({ ...item, ...action.payload }) }) };
    case 'INIT_BOARD_VIEW_RECORD_COUNT':
      return {
        ...state,
        boardViewRecordCount: update(boardViewRecordCount, { $apply: item => ({ ...item, ...data }) }),
      };
    case 'UPDATE_BOARD_VIEW_RECORD_COUNT':
      return {
        ...state,
        boardViewRecordCount: update(boardViewRecordCount, {
          [data[0]]: { $apply: item => Math.max(0, item + data[1]) },
        }),
      };
    case 'UPDATE_MULTI_SELECT_BOARD':
      return { ...state, boardData: updateMultiSelectBoard(boardData, data) };
    default:
      return state;
  }
}

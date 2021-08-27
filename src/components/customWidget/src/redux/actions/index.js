import _ from 'lodash';
import util from '../../utils/util';
import global from '../../config/globalConfig';

// 改变当前正生效的widget
export const changeEffictiveWidget = id => dispatch => {
  global.isFirstInputSelect = true;
  dispatch({
    type: 'CHANGE_EFFICTIVE_WIDGET',
    id,
  });
};

// 改变生效的widget为默认
export const clearEffictiveWidget = () => {
  return {
    type: 'CLEAR_EFFICTIVE_WIDGET',
  };
};

// 改变所有widgets数据
export const changeAllWidgets = data => {
  return {
    type: 'CHANGE_ALL_WIDGETS',
    data,
  };
};

// 改变拖拽状态
export const changeDragState = dragState => {
  return {
    type: 'CHANGE_DRAG_STATE',
    dragState,
  };
};

// 将填充块替换为插入的组件
export const insertWidget = widget => dispatch => {
  dispatch({
    type: 'INSERT_WIDGET',
    widget,
    location,
  });
  dispatch(changeEffictiveWidget(widget.id));
};

// 往某位置填充填充块
export const insertFiller = (filler, location, widget) => dispatch => {
  dispatch({
    type: 'INSERT_FILLER',
    filler,
    location,
    widget,
  });
};

// 重置编辑盒子状态
export const resetEditBox = () => {
  return {
    type: 'RESET_EDIT_BOX',
  };
};

// 改变拖拽的预览
export const changeDragPreview = widget => {
  return {
    type: 'CHANGE_DRAG_PREVIEW',
    widget,
  };
};

// 将某位置填为填充块
export const fillLocation = location => {
  return {
    type: 'FILL_LOCATION',
    location,
  };
};

export const addBottomWidget = (widget, activeNewWidget = true) => dispatch => {
  dispatch({
    type: 'ADD_BOTTOM_WIDGET',
    widget,
  });
  if (activeNewWidget) {
    dispatch(changeEffictiveWidget(widget.id));
  }
};

// 改变数据
export const changeWidgetData = (id, data) => dispatch => {
  dispatch({
    type: 'CHANGE_WIDGET_DATA',
    id,
    data,
  });
};

export const changeFormulaState = isEdit => dispatch => {
  dispatch({
    type: 'CHANGE_FORMULA_STATE',
    isEdit,
  });
};

// 新公式更改当前公式编辑状态
export const changeFormulaEditStatus = status => dispatch => {
  dispatch({
    type: 'CHANGE_FORMULA_EDIT_STATUS',
    status,
  });
};

// 高亮选中
export const seleteWidgetHighlight = id => dispatch => {
  dispatch({
    type: 'SELETE_WIDGHT_HIGH_LIGHT',
    id,
  });
};

// 改变控件
export const changeWidget = (id, widget) => dispatch => {
  dispatch({
    type: 'CHANGE_WIDGET',
    id,
    widget,
  });
  dispatch({
    type: 'REFRESH_EFFICTIVE_WIDGET',
    id,
  });
};

// 改变控件，不改变选中的widget
export const changeWidgetWithoutRefresh = (id, widget) => dispatch => {
  dispatch({
    type: 'CHANGE_WIDGET',
    id,
    widget,
  });
};

// 设置字段为标题
export const setWidgetAttribute = (id, value) => dispatch => {
  dispatch({
    type: 'SET_WIDGET_ATTRIBUTE',
    id,
    value,
  });
  dispatch({
    type: 'REFRESH_EFFICTIVE_WIDGET',
    id,
  });
};

// 改变oa选项
export const changeOAOptions = (id, data) => dispatch => {
  dispatch({
    type: 'CHANGE_OA_OPTIONS',
    id,
    data,
  });
  dispatch({
    type: 'REFRESH_EFFICTIVE_WIDGET',
    id,
  });
};

// 改变task选项
export const changeTASKOptions = (id, data) => {
  return {
    type: 'CHANGE_TASK_OPTIONS',
    id,
    data,
  };
};

export const deleteWidget = (id, clearEffictive = true) => dispatch => {
  dispatch({
    type: 'DELETE_WIDGET',
    id,
  });
  if (clearEffictive) {
    dispatch({
      type: 'CLEAR_EFFICTIVE_WIDGET',
    });
  }
  dispatch({
    type: 'CHANGE_FORMULA_EDIT_STATUS',
    status: false,
  });
};

// 为空时返回变成默认字符，需求暂时弃用
export const emptyToDefault = () => ({
  type: 'EMPTY_TO_DEFAULT',
});

// 为空时返回上个状态
export const emptyToPrev = () => ({
  type: 'EMPTY_TO_PREV',
});

export const changeDragingItem = widget => ({
  type: 'CHANGE_DRAGING_ITEM',
  widget,
});

export const refreshAllWidgets = data => ({
  type: 'REFRESH_ALL_WIDGETS',
  data,
});

export const seleteSingleWidghtFormula = id => dispatch => {
  dispatch({
    type: 'SELECT_SINGLE_WIDGHT_FORMULA',
    id,
  });
};

export const seleteSingleWidghtCustomFormula = id => dispatch => {
  dispatch({
    type: 'SELECT_SINGLE_WIDGHT_CUSTOM_FORMULA',
    id,
  });
};

/** 改变半行和整行 */
export const changeWidgetHalf = (id, half) => ({
  type: 'CHANGE_WIDGET_HALF',
  id,
  half,
});

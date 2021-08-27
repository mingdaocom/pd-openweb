import { combineReducers } from 'redux';
import config from '../../config';
import EditWidgetContainer from '../../utils/editWidgetContainer';
import util from '../../utils/util';
import _ from 'lodash';

let editWidgetContainer = new EditWidgetContainer();

// 选中的widget的id
const effictiveWidgetId = (state = '', action) => {
  switch (action.type) {
    case 'CHANGE_EFFICTIVE_WIDGET':
      return action.id;
    case 'CLEAR_EFFICTIVE_WIDGET':
      return '';
    case 'REFRESH_EFFICTIVE_WIDGET':
      return action.id;
    default:
      return state;
  }
};

// 拖动状态
const dragState = (state = config.DRAG_STATE.DEFAULT, action) => {
  switch (action.type) {
    case 'CHANGE_DRAG_STATE':
      return action.dragState;
    default:
      return state;
  }
};

// 正在被拖动的widget
const dragingItem = (state = {}, action) => {
  switch (action.type) {
    case 'CHANGE_DRAGING_ITEM':
      return _.cloneDeep(action.widget);
    case 'INSERT_WIDGET':
      return {};
    default:
      return state;
  }
};

// editBox的数据
const editWidgets = (state = editWidgetContainer.container, action) => {
  switch (action.type) {
    // 不缓存数据地刷新整个contaienr
    case 'REFRESH_ALL_WIDGETS':
      editWidgetContainer.changeContainer(action.data);
      return _.cloneDeep(editWidgetContainer.container);
    // 替换整个container
    case 'CHANGE_ALL_WIDGETS':
      editWidgetContainer.changeContainer(action.data);
      return util.cloneDeepContainer(editWidgetContainer.container);
    // 插入填充物
    case 'INSERT_FILLER':
      if (action.location === 'bottom') {
        // 拖动到的位置是底部
        editWidgetContainer.insertFillerBottom(action.filler);
      } else {
        editWidgetContainer.insertFiller(action.filler, action.location);
      }
      return util.cloneDeepContainer(editWidgetContainer.container);
    // 插入新组件
    case 'INSERT_WIDGET':
      editWidgetContainer.insertWidget(action.widget);
      return util.cloneDeepContainer(editWidgetContainer.container); // cloneDeepContainer 深度克隆并进行一些处理
    case 'RESET_EDIT_BOX':
      editWidgetContainer.resetEditBox(action.widgets);
      return _.cloneDeep(editWidgetContainer.container);
    case 'FILL_LOCATION':
      editWidgetContainer.fillLocation(action.location);
      return _.cloneDeep(editWidgetContainer.container);
    case 'ADD_BOTTOM_WIDGET':
      editWidgetContainer.addBottomWidget(action.widget);
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'CHANGE_WIDGET_DATA':
      editWidgetContainer.changeWidgetData(action.id, action.data);
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'CHANGE_WIDGET':
      editWidgetContainer.changeWidget(action.id, action.widget);
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'CHANGE_OA_OPTIONS':
      editWidgetContainer.changeOAOptions(action.id, action.data);
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'SET_WIDGET_ATTRIBUTE':
      editWidgetContainer.setWorksheetAttribute(action.id, action.value);
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'CHANGE_TASK_OPTIONS':
      editWidgetContainer.changeTASKOptions(action.id, action.data);
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'DELETE_WIDGET':
      editWidgetContainer.deleteWidget(action.id);
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'EMPTY_TO_DEFAULT':
      editWidgetContainer.emptyToDefault();
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'EMPTY_TO_PREV':
      editWidgetContainer.emptyToPrev();
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'SELETE_WIDGHT_HIGH_LIGHT':
      editWidgetContainer.seleteHighWidght(action.id);
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'SELECT_SINGLE_WIDGHT_FORMULA':
      editWidgetContainer.seleteSingleWidghtFormula(action.id);
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'SELECT_SINGLE_WIDGHT_CUSTOM_FORMULA':
      editWidgetContainer.seleteSingleWidghtCustomFormula(action.id);
      return util.cloneDeepContainer(editWidgetContainer.container);
    case 'CHANGE_WIDGET_HALF':
      editWidgetContainer.changeWidgetHalf(action.id, action.half);
      return util.cloneDeepContainer(editWidgetContainer.container);
    default:
      return state;
  }
};

// 更新编辑状态
const formulaState = (state = config, action) => {
  switch (action.type) {
    case 'CHANGE_FORMULA_STATE':
      return Object.assign({}, state, { formulaEdit: action.isEdit });
    default:
      return state;
  }
};

// 新公式公式编辑状态
const formulaEditStatus = (state = false, action) => {
  switch (action.type) {
    case 'CHANGE_FORMULA_EDIT_STATUS':
      return action.status;
    default:
      return state;
  }
};

// 拖拽preview
const jDragPreviewWidget = (state = '', action) => {
  switch (action.type) {
    case 'CHANGE_DRAG_PREVIEW':
      return Object.assign({}, action.widget);
    default:
      return state;
  }
};

export default combineReducers({
  effictiveWidgetId,
  dragState,
  dragingItem,
  editWidgets,
  jDragPreviewWidget,
  formulaState,
  formulaEditStatus,
});

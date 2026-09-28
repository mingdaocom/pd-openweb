import _, { find, get, includes } from 'lodash';
import { CONTROL_EDITABLE_WHITELIST, SYSTEM_CONTROLS } from 'src/utils/domain/worksheet/constants';
import { SYSTEM_CONTROL_WITH_UAID, WORKFLOW_SYSTEM_CONTROL } from './widget';

const NEW_RECORD_FROM = [2, 4, 5, 21];

/**
 * 根据字段权限、控件权限和表单来源计算控件的可见与可编辑状态。
 */
export const controlState = (data, from) => {
  if (!data) {
    return {};
  }

  const controlPermissions = data.controlPermissions || '111';
  const fieldPermission = data.fieldPermission || '111';
  let state = {
    visible: true,
    editable: true,
  };

  if (_.includes(NEW_RECORD_FROM, from)) {
    state.visible = fieldPermission[0] === '1' && fieldPermission[2] === '1' && controlPermissions[2] === '1';
    state.editable = fieldPermission[1] === '1';
  } else {
    state.visible = fieldPermission[0] === '1' && controlPermissions[0] === '1';
    state.editable = fieldPermission[1] === '1' && controlPermissions[1] === '1';
  }

  return state;
};

/**
 * 合并控件自身与所属分段的权限，得到最终控件状态。
 */
export const getControlStateAndCheckSectionControl = (data, from, formData) => {
  const sectionControl = data.sectionId && _.find(formData, c => c.controlId === data.sectionId);

  if (!sectionControl) {
    return controlState(data, from);
  }

  const stateOfControl = controlState(data, from);
  const stateOfSectionControl = controlState({ ...sectionControl, controlPermissions: '111' }, from);
  return {
    ...stateOfControl,
    editable: stateOfControl.editable && stateOfSectionControl.editable,
  };
};

/**
 * 替换权限或状态位串中指定位置的字符。
 */
export function replaceByIndex(str = '111', index = 0, replacestr = '') {
  return str.substring(0, index) + replacestr + str.substring(index + 1);
}

/**
 * 在控件列表完全缺少系统字段时补充标准系统控件。
 */
export function completeControls(controls) {
  // 不存在系统字段的话 补充系统字段
  const sysIds = SYSTEM_CONTROLS.map(c => c.controlId);

  if (!_.some(controls.map(c => _.includes(sysIds, c.controlId)))) {
    controls = controls.concat(SYSTEM_CONTROLS);
  }

  return controls;
}

/**
 * 将控件权限统一提升为可用、可见且可编辑状态。
 */
export const getHighAuthControls = controls => {
  return controls.map(l => ({
    ...l,
    disabled: false,
    fieldPermission: '111',
    controlPermissions: '111',
    advancedSetting: _.assign({}, l.advancedSetting, { custom_event: '' }),
  }));
};

/**
 * 判断控件在当前视图与权限下是否允许批量编辑。
 */
export function controlBatchCanEdit(control, view = { controls: [] }) {
  return (
    ((control.type < 10000 &&
      includes(CONTROL_EDITABLE_WHITELIST, control.type) &&
      !(control.type === 29 && includes(['2', '5', '6'], get(control, 'advancedSetting.showtype'))) &&
      !(control.type === 14 && includes(['0'], get(control, 'advancedSetting.allowdelete') || '1')) &&
      !find(SYSTEM_CONTROL_WITH_UAID.concat(WORKFLOW_SYSTEM_CONTROL), { controlId: control.controlId }) &&
      !find(view.controls, id => control.controlId === id)) ||
      control.controlId === 'ownerid') &&
    ((controlState(control).visible && controlState(control).editable) ||
      (view.viewId && view.viewId === view.worksheetId))
  );
}

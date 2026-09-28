import { find, get, identity } from 'lodash';

/**
 * 关联表格是否可编辑。
 * store 初始化与 index.js 里 allowEdit 变化时的 UPDATE_BASE 必须共用这里，
 * 否则后者会用 props 原值覆盖掉初始化时算好的结果，让下面这些限制失效。
 */
export function getRelateRecordTableAllowEdit(allowEdit, control) {
  // 工作流填写记录（公开链接）里的关联记录表格形态不允许编辑
  if (get(window, 'shareState.isPublicWorkflowRecord')) {
    return false;
  }

  return Boolean(allowEdit) && !(control && control.disabled);
}

// 业务规则
function overrideControls(control, controls) {
  return controls.map(c => {
    const resetControl = find(control.relationControls, { controlId: c.controlId });

    if (resetControl) {
      c.required = resetControl.required;
      c.fieldPermission = resetControl.fieldPermission;
    }

    return c;
  });
}

export function getVisibleControls(control, controls, sheetHiddenColumnIds = [], disableMaskDataControls = {}) {
  const overriddenControls = overrideControls(control, controls)
    .filter(c => !find(sheetHiddenColumnIds, id => c.controlId === id))
    .map(c =>
      disableMaskDataControls[c.controlId]
        ? {
            ...c,
            advancedSetting: Object.assign({}, c.advancedSetting, {
              datamask: '0',
            }),
          }
        : c,
    );
  return control.showControls.map(sid => find(overriddenControls, { controlId: sid })).filter(identity);
}

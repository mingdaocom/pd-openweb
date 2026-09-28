import { get, includes, isArray, isEmpty } from 'lodash';
import { ALL_SYS } from 'src/utils/domain/control/widget';
import { getWidgetTypeName } from 'src/utils/services/app';

/**
 * 按 AI 使用场景、字段权限及附件/人员开关筛选可用控件。
 */
function filterControlsByFormFieldPermissions(controls, { from, includeUsers = false, includeFiles = false }) {
  if (!isArray(controls)) return [];

  return controls.filter(control => {
    if (includes(ALL_SYS, control.controlId)) return false;
    if (includes([21, 22, 31, 33, 25, 32, 38, 42, 43, 47, 45, 30, 51, 37, 22, 52, 53, 54, 10010], control.type)) {
      return false;
    }

    if (from === 'generate-record') {
      const hasFieldPermission = !control.fieldPermission || control.fieldPermission.endsWith('11');
      const hasControlPermission = !control.controlPermissions || control.controlPermissions.endsWith('1');
      return hasFieldPermission && hasControlPermission;
    }

    if (from === 'generate-example-data') {
      if (control.type === 24 && control.enumDefault === 1) return false;
      if (!includeUsers && control.type === 26) return false;
      if (!includeFiles && control.type === 14) return false;
    }

    return true;
  });
}

/**
 * 将单个工作表控件转换为 AI 可识别的精简字段描述，并递归处理子表。
 */
function buildFormFieldControlObject(control, options = {}) {
  const type = control.type;
  const base = {
    controlId: control.controlId || '',
    name: control.controlName || '',
    type,
  };

  if (type === 26 || type === 27) return { ...base, isMultiple: control.enumDefault !== 0 };
  if (type === 9 || type === 10 || type === 11) {
    const option = isEmpty(control.options)
      ? null
      : control.options.filter(item => !item.isDeleted).map(item => item.value);
    return { ...base, option };
  }

  if (type === 28) {
    const max = get(control, 'advancedSetting.max');
    return { ...base, range: max ? `1~${max}` : '1~5' };
  }

  if (type === 29) {
    return { ...base, isMultiple: control.enumDefault !== 1, relatedWorksheetId: control.dataSource || '' };
  }

  if (type === 35) return { ...base, relatedWorksheetId: control.dataSource || '' };
  if (type === 34) {
    const subformControls = control.relationControls || [];

    if (options.from === 'generate-example-data' && subformControls.some(item => includes([29, 35], item.type))) {
      return { ...base, subformControls: [] };
    }

    const filteredControls = filterControlsByFormFieldPermissions(subformControls, options);
    return { ...base, subformControls: filteredControls.map(item => buildFormFieldControlObject(item, options)) };
  }

  const { controlType, controlTypeName } = getWidgetTypeName(type);
  return { controlId: base.controlId, name: base.name, controlType, controlTypeName };
}

/**
 * 从工作表模板生成供 AI 生成记录或示例数据使用的字段描述列表。
 */
export function buildFormFieldsControls(worksheetInfo, options = {}) {
  const controls = get(worksheetInfo, 'template.controls', []);
  const filteredControls = filterControlsByFormFieldPermissions(controls, options);
  return filteredControls.map(control => buildFormFieldControlObject(control, options));
}

import { isRelateRecordTableControl } from 'src/utils/control.js';
import { VIEWCONTROL_CONDITION_MULTI_TYPE, VIEWCONTROL_CONDITION_TYPE } from './config';

export const canSetGroup = (control = {}, worksheetId = '', view = {}) => {
  if (view.viewType === 1) {
    //看板 不支持多选类型的字段作为分组字段
    const dataType = control?.type === 30 ? control?.sourceControlType : control?.type;
    const isMulti =
      VIEWCONTROL_CONDITION_MULTI_TYPE.includes(dataType) &&
      (([26, 27, 48].includes(dataType) && control?.enumDefault === 1) || //多选类型
        (dataType === 29 && control?.enumDefault === 2) || //关联多条
        dataType === 10); //多选字段
    if (isMulti) {
      return false;
    }
  }
  if (
    VIEWCONTROL_CONDITION_TYPE.includes(control.type) ||
    (control.type === 30 && //支持他表字段 仅存储
      VIEWCONTROL_CONDITION_TYPE.includes(control.sourceControlType) &&
      (control.strDefault || '').split('')[0] !== '1')
  ) {
    //表格形式不支持
    if (isRelateRecordTableControl(control)) return false;
    if (control.type === 29) {
      //关联他表 且 单条/多条
      if (worksheetId !== control.dataSource) {
        return true;
      }
    } else {
      return true;
    }
  }
};

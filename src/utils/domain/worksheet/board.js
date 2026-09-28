import { isRelateRecordTableControl } from 'src/utils/domain/control/type';

export const CAN_AS_BOARD_OPTION = [9, 10, 11];

const VIEWCONTROL_CONDITION_TYPE = [9, 10, 11, 28, 26, 27, 48, 29];
const VIEWCONTROL_CONDITION_MULTI_TYPE = [10, 29, 26, 27, 48];

/** 判断控件能否作为看板分组字段。 */
export const canSetGroup = (control = {}, worksheetId = '', view = {}) => {
  if (view.viewType === 1) {
    const dataType = control?.type === 30 ? control?.sourceControlType : control?.type;
    const isMulti =
      VIEWCONTROL_CONDITION_MULTI_TYPE.includes(dataType) &&
      (([26, 27, 48].includes(dataType) && control?.enumDefault === 1) ||
        (dataType === 29 && control?.enumDefault === 2) ||
        dataType === 10);

    if (isMulti) return false;
  }

  if (
    VIEWCONTROL_CONDITION_TYPE.includes(control.type) ||
    (control.type === 30 &&
      VIEWCONTROL_CONDITION_TYPE.includes(control.sourceControlType) &&
      (control.strDefault || '').split('')[0] !== '1')
  ) {
    if (isRelateRecordTableControl(control)) return false;
    if (control.type === 29) return worksheetId !== control.dataSource;
    return true;
  }

  return undefined;
};

import _ from 'lodash';
import { renderText as renderCellText } from './display';
import { getControlByControlId } from './filters';

/** 按字段展示规则将字段值格式化为文本。 */
export function formatColumnToText(column, numberOnly, noMask, options = {}) {
  return renderCellText(column, {
    noUnit: numberOnly,
    noSplit: numberOnly,
    noMask: noMask,
    doNotHandleTimeZone: options.doNotHandleTimeZone,
  });
}

// 通过id 获取控件的值
/** 根据字段标识读取记录值，并按无单位数值格式返回。 */
export function getControlValue(id, allControls, worksheetData) {
  return getControlTextValue(id, allControls, worksheetData, true);
}

// 通过id 获取控件的文本值
/** 根据字段标识读取并格式化记录中的字段值。 */
export function getControlTextValue(id, allControls, worksheetData, numberOnly) {
  const control = getControlByControlId(allControls, id);

  if (!control || _.isEmpty(worksheetData)) {
    return '';
  }

  const { type, controlId } = control;

  if (_.includes([6, 8], type)) {
    return worksheetData[controlId];
  }

  if (controlId) {
    return (
      formatColumnToText(
        _.assign({}, control, {
          value: worksheetData[controlId],
        }),
        numberOnly,
      ) || ''
    );
  } else {
    return '';
  }
}

import _ from 'lodash';
import { getSelectedOptions } from 'worksheet/util';

export function parseColumnToText(column, formData = {}) {
  const type = column.originType;
  const { id, value, valueText, config } = column;
  switch (type) {
    case 2: // EMAIL_INPUT
    case 5: // CRED_INPUT
    case 7: // TEXTAREA_INPUT
      return value || '';
    case 4:
      return formData[id] ? formData[id].valueText : '';
    case 6: // NUMBER_INPUT
    case 8: // MONEY_AMOUNT
      return value ? value + (config.unit || '') : '';
    // OPTIONS // TODO NOCHANGE
    case 9:
    case 10:
      return getSelectedOptions(column.data, column.value)
        .map(d => d.label)
        .join(',');
    case 3: // PHONE_NUMBER
    case 11: // DROPDOWN
    case 15: // DATE_INPUT
    case 16: // DATE_INPUT
    case 17: // DATE_TIME_RANGE
    case 18: // DATE_TIME_RANGE
    case 19: // AREA_INPUT
    case 23: // AREA_INPUT
    case 24: // AREA_INPUT
    case 26: // USER_PICKER
    case 27: // GROUP_PICKER
      return (config && config.label) || '';
    // case 12:
    // case 13:
    // ATTACHMENT
    case 14:
      return _.flatten(value).length ? _.flatten(value)[0].oldOriginalFileName + _.flatten(value)[0].fileExt : '';
    // FORMULA
    case 20:
    case 25: // MONEY_CN
    case 31: // NEW_FORMULA 公式
    case 32: // CONCATE 文本组合
      return valueText || '';
    // SCORE
    case 28:
      return value ? _l('%0级', value) : '';
    // RELATESHEET
    // case 29:  // TODO 关联他表忽略
    // SHEETFIELD
    // case 30:  // TODO 他表字段忽略
    // case 36:  // TODO switch字段忽略
    default:
      return valueText || '';
  }
}
